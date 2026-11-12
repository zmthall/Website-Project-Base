// TODO [AUTH-03]: Replace long-term environment preset passwords with managed provisioning/MFA and audited role changes; add password-change, deletion and recovery policies for registered accounts. See docs/integration-audit.md.
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { CustomerAccount } from '../../app/features/customer/types';
const derive = promisify(scrypt);
type StoredAccount = { id: string; email: string; password_hash: string; salt: string };
/** Private local account database. Passwords are salted and hashed, never stored in plaintext. */
export class CustomerAccounts {
  private db: DatabaseSync;
  constructor(filename: string) {
    if (filename !== ':memory:') {
      const path = resolve(filename);
      const publicPath = resolve('public');
      if (path === publicPath || path.startsWith(publicPath + '/'))
        throw new Error('Customer database must be private');
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    }
    this.db = new DatabaseSync(filename);
    if (filename !== ':memory:') chmodSync(filename, 0o600);
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL)',
    );
  }
  private profile(row: StoredAccount): CustomerAccount {
    return {
      id: row.id,
      email: row.email,
      displayName: row.email,
      emailVerified: false,
      roles: ['customer'],
    };
  }
  async register(email: string, password: string) {
    const salt = randomBytes(32).toString('hex');
    const hash = (await derive(password, salt, 64)) as Buffer;
    const row = {
      id: randomBytes(16).toString('hex'),
      email: email.trim().toLowerCase(),
      password_hash: hash.toString('hex'),
      salt,
    };
    this.db
      .prepare('INSERT INTO customers (id, email, password_hash, salt) VALUES (?, ?, ?, ?)')
      .run(row.id, row.email, row.password_hash, row.salt);
    return this.profile(row);
  }
  async login(email: string, password: string): Promise<CustomerAccount | null> {
    const row = this.db
      .prepare('SELECT * FROM customers WHERE email = ?')
      .get(email.trim().toLowerCase()) as StoredAccount | undefined;
    // Perform the same expensive derivation even when the email does not exist.
    const candidate = (await derive(password, row?.salt || 'unknown-customer-salt', 64)) as Buffer;
    const expected = row ? Buffer.from(row.password_hash, 'hex') : Buffer.alloc(64);
    const matches = timingSafeEqual(candidate, expected);
    return row && matches ? this.profile(row) : null;
  }
  close() {
    this.db.close();
  }
}
