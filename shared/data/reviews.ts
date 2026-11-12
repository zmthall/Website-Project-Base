import type { Testimonial } from '../types/testimonials';

/** Presentation switches; the master switch is site.features.reviews. */
export const reviewsConfig = { homepagePreview: true, showSubmissionDemo: true };

/** Illustrative records only. Replace with approved published reviews or API data. */
export const sampleReviews = [
  {
    id: 'review-1',
    author: { name: 'Alex M.' },
    rating: { value: 5, scale: 5 },
    date: '2026-06-12',
    content:
      'Clear communication from the first conversation. Every step felt thoughtful and easy to follow.',
  },
  {
    id: 'review-2',
    author: { name: 'Jordan R.' },
    rating: { value: 4, scale: 5 },
    date: '2026-05-28',
    content:
      'A helpful team and a considered approach. We appreciated the time spent understanding what we needed.',
  },
  {
    id: 'review-3',
    author: { name: 'Sam T.' },
    rating: { value: 5, scale: 5 },
    date: '2026-05-16',
    content:
      'The little details made a difference. We always knew what was happening and what to expect next.',
  },
  {
    id: 'review-4',
    author: { name: 'Taylor K.' },
    rating: { value: 4, scale: 5 },
    date: '2026-04-30',
    content:
      'Friendly, approachable, and happy to answer questions. A positive experience from start to finish.',
  },
  {
    id: 'review-5',
    author: { name: 'Casey L.' },
    rating: { value: 3, scale: 5 },
    date: '2026-04-14',
    content:
      'The result was useful. Some updates could have arrived sooner, but the team listened to our feedback.',
  },
  {
    id: 'review-6',
    author: { name: 'Morgan P.' },
    rating: { value: 5, scale: 5 },
    date: '2026-03-22',
    content:
      'A straightforward process with people who care about their work. We felt well looked after.',
  },
] satisfies Testimonial[];
