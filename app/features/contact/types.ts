import type { Consent, SubmissionReceipt } from '../_shared/types';
export interface ContactInquiry {
  name: string;
  email: string;
  message: string;
  reason?: string;
  locationId?: string;
  department?: string;
  consent?: Consent;
  website?: string;
}
export type ContactReceipt = SubmissionReceipt;
