import type { Address } from '../../../../../shared/types/business';
export interface Job {
  id: string;
  slug: string;
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType: string;
  category?: string;
  address: Address;
  active: boolean;
}
export interface Application {
  name: string;
  email: string;
  resumeUploadId: string;
  coverLetter?: string;
  answers?: Record<string, string>;
}
export interface ApplicationReceipt {
  id: string;
  status: 'received';
}
