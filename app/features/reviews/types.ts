import type { Testimonial } from '../../../shared/types/testimonials';
export interface Review extends Testimonial {
  status: 'published';
}
export interface ReviewSubmission {
  name: string;
  content: string;
  rating: number;
}
export interface ReviewReceipt {
  id: string;
  status: 'pending-moderation';
}
export interface ReviewSummary {
  value: number;
  count: number;
  scale: number;
}
