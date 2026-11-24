import { createHash, randomUUID } from 'node:crypto';
import { createError } from 'h3';
import type {
  ContactDetails,
  NotificationJob,
  WorkflowCoreRepository,
} from '../../shared/types/workflows';

export const fail = (statusCode: number, statusMessage: string): never => {
  throw createError({ statusCode, statusMessage });
};

export const validText = (value: unknown, max = 1000) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

export function validateContact(value: unknown) {
  const contact = value as ContactDetails | undefined;
  if (
    !contact ||
    !validText(contact.name, 200) ||
    !validText(contact.email, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ||
    (contact.phone !== undefined &&
      (typeof contact.phone !== 'string' || contact.phone.length > 100))
  )
    fail(400, 'Enter valid contact details');
}

/** Shared ownership, idempotency and outbox mechanics used by workflow feature services. */
export class WorkflowServiceSupport<Repository extends WorkflowCoreRepository> {
  constructor(
    public readonly repo: Repository,
    protected readonly now = () => Date.now(),
  ) {}

  protected owned<T extends { ownerId: string }>(records: Map<string, T>, id: string, ownerId: string) {
    const record = records.get(id);
    if (!record || record.ownerId !== ownerId) return fail(404, 'Record not found');
    return record;
  }

  protected repeat<T>(owner: string, operation: string, key: string, input: unknown, run: () => T) {
    if (!/^[\w-]{8,100}$/.test(key)) fail(400, 'A valid Idempotency-Key is required');
    const id = `${owner}:${operation}:${key}`;
    const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const previous = this.repo.attempts.get(id);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        fail(409, 'Idempotency key reused with different input');
      return structuredClone(previous.result) as T;
    }
    if (this.repo.attempts.size >= 10000) fail(503, 'Demo repository is full; restart it');
    const result = run();
    this.repo.attempts.set(id, { fingerprint, result: structuredClone(result) });
    return structuredClone(result);
  }

  protected notify(
    ownerId: string,
    resourceId: string,
    kind: NotificationJob['kind'],
    dueAt = new Date(this.now()).toISOString(),
  ) {
    const job: NotificationJob = {
      id: randomUUID(),
      ownerId,
      resourceId,
      kind,
      dueAt,
      status: 'queued',
    };
    this.repo.notifications.set(job.id, job);
  }
}
