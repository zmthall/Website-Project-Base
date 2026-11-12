import type { Consent } from '../_shared/types';
export interface SubscriptionRequest {
  email: string;
  listId?: string;
  consent: Consent;
}
export interface SubscriptionResult {
  status: 'pending-confirmation' | 'subscribed' | 'already-subscribed';
}
export interface NewsletterPreferences {
  lists: string[];
  subscribed: boolean;
}
