import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { AttachmentReference } from '../../../../shared/types/workflows';
import type {
  UploadMetadata,
  UploadRequest,
  UploadSession,
} from '../../app/features/uploads/types';

type UploadRow = {
  id: string;
  owner_id: string;
  name: string;
  size: number;
  mime_type: string;
  status: UploadMetadata['status'];
  expires_at: string;
  stored: number;
  request_hash: string;
  claimed: number;
};

const allowedTypes = new Map([
  ['application/pdf', ['.pdf']],
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
]);
const maxUploadBytes = 5 * 1024 * 1024;

function requestHash(request: UploadRequest) {
  return createHash('sha256').update(JSON.stringify(request)).digest('hex');
}

function matchesDeclaredType(bytes: Uint8Array, mimeType: string) {
  const starts = (...signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);
  if (mimeType === 'application/pdf')
    return Buffer.from(bytes.subarray(0, 5)).toString() === '%PDF-';
  if (mimeType === 'image/png') return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (mimeType === 'image/jpeg') return starts(0xff, 0xd8, 0xff);
  return false;
}

function appearsUnsafe(bytes: Uint8Array) {
  const beginning = Buffer.from(bytes.subarray(0, 2)).toString('ascii');
  const text = Buffer.from(bytes).toString('latin1');
  return beginning === 'MZ' || text.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
}

export interface LocalUploadStoreOptions {
  directory: string;
  database: string;
  now?: () => number;
  policy?: {
    maxFilesPerOwner: number;
    maxTotalBytesPerOwner: number;
  };
  scanner?: UploadScanner;
}

export interface UploadScanner {
  scan(bytes: Uint8Array): { safe: boolean };
}

export class UploadStoreError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

function fail(message: string, statusCode = 400): never {
  throw new UploadStoreError(message, statusCode);
}

export class LocalUploadStore {
  private db: DatabaseSync;
  private directory: string;
  private now: () => number;
  private policy: NonNullable<LocalUploadStoreOptions['policy']>;
  private scanner: UploadScanner;

  constructor(options: LocalUploadStoreOptions) {
    this.directory = resolve(options.directory);
    this.now = options.now ?? Date.now;
    this.policy = options.policy ?? {
      maxFilesPerOwner: 5,
      maxTotalBytesPerOwner: 25 * 1024 * 1024,
    };
    this.scanner = options.scanner ?? { scan: (bytes) => ({ safe: !appearsUnsafe(bytes) }) };
    const database = resolve(options.database);
    const publicDirectory = resolve('public');
    if (
      this.directory === publicDirectory ||
      this.directory.startsWith(publicDirectory + '/') ||
      database === publicDirectory ||
      database.startsWith(publicDirectory + '/')
    )
      fail('Upload storage must remain private', 500);
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    mkdirSync(dirname(database), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(database);
    chmodSync(database, 0o600);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        status TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        stored INTEGER NOT NULL DEFAULT 0,
        idempotency_key TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        claimed INTEGER NOT NULL DEFAULT 0,
        UNIQUE(owner_id, idempotency_key)
      )
    `);
    const columns = this.db.prepare('PRAGMA table_info(uploads)').all() as { name: string }[];
    if (!columns.some(({ name }) => name === 'claimed'))
      this.db.exec('ALTER TABLE uploads ADD COLUMN claimed INTEGER NOT NULL DEFAULT 0');
  }

  private row(id: string): UploadRow | undefined {
    return this.db.prepare('SELECT * FROM uploads WHERE id = ?').get(id) as UploadRow | undefined;
  }

  private owned(ownerId: string, id: string): UploadRow | undefined {
    const row = this.row(id);
    return row?.owner_id === ownerId ? row : undefined;
  }

  private path(id: string, ready = false) {
    return join(this.directory, `${id}.${ready ? 'ready' : 'quarantine'}`);
  }

  private metadata(row: UploadRow): UploadMetadata {
    return {
      id: row.id,
      name: row.name,
      size: row.size,
      mimeType: row.mime_type,
      status: row.status,
      expiresAt: row.expires_at,
    };
  }

  initialize(ownerId: string, request: UploadRequest, idempotencyKey: string): UploadSession {
    this.cleanupExpired();
    const extensions = allowedTypes.get(request.mimeType);
    const normalizedName = request.name.trim();
    if (
      !ownerId ||
      !idempotencyKey ||
      !normalizedName ||
      normalizedName !== basename(normalizedName) ||
      normalizedName.length > 180 ||
      Array.from(normalizedName).some((character) => {
        const code = character.charCodeAt(0);
        return code <= 31 || code === 127;
      }) ||
      !Number.isSafeInteger(request.size) ||
      request.size <= 0 ||
      request.size > maxUploadBytes ||
      !extensions?.some((extension) => normalizedName.toLowerCase().endsWith(extension))
    )
      fail('Invalid upload metadata');
    const fingerprint = requestHash({ ...request, name: normalizedName });
    const existing = this.db
      .prepare('SELECT * FROM uploads WHERE owner_id = ? AND idempotency_key = ?')
      .get(ownerId, idempotencyKey) as UploadRow | undefined;
    if (existing) {
      if (existing.request_hash !== fingerprint) fail('Idempotency key conflict', 409);
      return {
        id: existing.id,
        contentPath: `/api/uploads/${existing.id}/content`,
        expiresAt: existing.expires_at,
      };
    }
    const usage = this.db
      .prepare(
        "SELECT COUNT(*) AS files, COALESCE(SUM(size), 0) AS bytes FROM uploads WHERE owner_id = ? AND status != 'rejected'",
      )
      .get(ownerId) as { files: number; bytes: number };
    if (
      usage.files >= this.policy.maxFilesPerOwner ||
      usage.bytes + request.size > this.policy.maxTotalBytesPerOwner
    )
      fail('Upload quota exceeded', 429);
    const id = randomUUID();
    const expiresAt = new Date(this.now() + 60 * 60 * 1000).toISOString();
    this.db
      .prepare(
        'INSERT INTO uploads (id,owner_id,name,size,mime_type,status,expires_at,stored,idempotency_key,request_hash,claimed) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      )
      .run(
        id,
        ownerId,
        normalizedName,
        request.size,
        request.mimeType,
        'processing',
        expiresAt,
        0,
        idempotencyKey,
        fingerprint,
        0,
      );
    return { id, contentPath: `/api/uploads/${id}/content`, expiresAt };
  }

  putContent(ownerId: string, id: string, bytes: Uint8Array) {
    const row = this.owned(ownerId, id);
    if (!row) fail('Upload not found', 404);
    if (row.status !== 'processing') fail('Upload is no longer accepting content', 409);
    if (bytes.length > row.size) fail('Upload exceeds its declared size', 413);
    writeFileSync(this.path(id), bytes, { mode: 0o600 });
    this.db.prepare('UPDATE uploads SET stored = 1 WHERE id = ?').run(id);
  }

  complete(ownerId: string, id: string): UploadMetadata {
    const row = this.owned(ownerId, id);
    if (!row) fail('Upload not found', 404);
    if (row.status === 'ready' || row.status === 'rejected') return this.metadata(row);
    if (!row.stored) fail('Upload content is missing', 409);
    const bytes = readFileSync(this.path(id));
    if (bytes.length !== row.size) fail('Upload size mismatch');
    if (!this.scanner.scan(bytes).safe || !matchesDeclaredType(bytes, row.mime_type)) {
      rmSync(this.path(id), { force: true });
      this.db.prepare("UPDATE uploads SET status = 'rejected' WHERE id = ?").run(id);
      return this.metadata({ ...row, status: 'rejected' });
    }
    renameSync(this.path(id), this.path(id, true));
    const expiresAt = new Date(this.now() + 24 * 60 * 60 * 1000).toISOString();
    this.db
      .prepare("UPDATE uploads SET status = 'ready', expires_at = ? WHERE id = ?")
      .run(expiresAt, id);
    return this.metadata({ ...row, status: 'ready', expires_at: expiresAt });
  }

  resolve(ownerId: string, ids: string[]): AttachmentReference[] {
    const expiresAt = new Date(this.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const attachments = ids.flatMap((id) => {
      const row = this.owned(ownerId, id);
      return row?.status === 'ready' && Date.parse(row.expires_at) > this.now()
        ? [{ id: row.id, name: row.name, size: row.size, mimeType: row.mime_type }]
        : [];
    });
    for (const attachment of attachments)
      this.db
        .prepare('UPDATE uploads SET expires_at = ?, claimed = 1 WHERE id = ?')
        .run(expiresAt, attachment.id);
    return attachments;
  }

  read(ownerId: string, id: string): { metadata: UploadMetadata; bytes: Buffer } | undefined {
    const row = this.owned(ownerId, id);
    if (!row || row.status !== 'ready' || Date.parse(row.expires_at) <= this.now())
      return undefined;
    return { metadata: this.metadata(row), bytes: readFileSync(this.path(id, true)) };
  }

  readClaimed(id: string): { metadata: UploadMetadata; bytes: Buffer } | undefined {
    const row = this.row(id);
    if (!row || !row.claimed || row.status !== 'ready' || Date.parse(row.expires_at) <= this.now())
      return undefined;
    return { metadata: this.metadata(row), bytes: readFileSync(this.path(id, true)) };
  }

  status(ownerId: string, id: string): UploadMetadata | undefined {
    const row = this.owned(ownerId, id);
    if (!row || Date.parse(row.expires_at) <= this.now()) return undefined;
    return this.metadata(row);
  }

  cleanupExpired() {
    const rows = this.db
      .prepare('SELECT * FROM uploads WHERE expires_at <= ?')
      .all(new Date(this.now()).toISOString()) as unknown as UploadRow[];
    for (const row of rows) {
      rmSync(this.path(row.id), { force: true });
      rmSync(this.path(row.id, true), { force: true });
      this.db.prepare('DELETE FROM uploads WHERE id = ?').run(row.id);
    }
    return rows.length;
  }

  close() {
    this.db.close();
  }

  remove(ownerId: string, id: string) {
    const row = this.owned(ownerId, id);
    if (!row) return false;
    if (row.claimed) fail('Attached uploads cannot be removed', 409);
    rmSync(this.path(id), { force: true });
    rmSync(this.path(id, true), { force: true });
    this.db.prepare('DELETE FROM uploads WHERE id = ?').run(id);
    return true;
  }
}
