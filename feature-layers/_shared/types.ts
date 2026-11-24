export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface SubmissionReceipt {
  id: string;
  status: 'received' | 'pending';
  message?: string;
}
export interface Consent {
  granted: true;
  policyVersion: string;
}
export interface MutationOptions {
  signal?: AbortSignal;
  idempotencyKey: string;
}
export interface ListOptions {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}
