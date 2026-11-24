// TODO [CONTENT-01]: Replace template identity, origin, example contacts/assets/testimonials/services and demo article sources with approved client content before enabling production indexing. See docs/integration-audit.md.
import type { SectionData } from '../types/sections';
import type { FormSchema } from '../types/forms';
import type { Article } from '../../shared/types/article';
import { contactForm } from '../../feature-layers/contact';
export const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
export const demoImages = [
  {
    src: '/images/demo/workspace.jpg',
    alt: 'A bright workspace with greenery and natural light',
    width: 1400,
    height: 933,
    caption: 'Lorem ipsum dolor sit amet.',
  },
  {
    src: '/images/demo/office.jpg',
    alt: 'An open office with shared tables and chairs',
    width: 1000,
    height: 667,
  },
  {
    src: '/images/demo/team.jpg',
    alt: 'Colleagues collaborating around a table',
    width: 1000,
    height: 667,
  },
];
export const issueForm: FormSchema = {
  id: 'issue',
  title: 'Report an issue',
  submitLabel: 'Preview report',
  fields: [
    { name: 'email', label: 'Reply email', type: 'email', required: true },
    { name: 'page', label: 'Page URL', type: 'url' },
    {
      name: 'category',
      label: 'Issue category',
      type: 'select',
      required: true,
      options: [
        { label: 'Something is not working', value: 'bug' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'other',
      label: 'Describe the category',
      type: 'text',
      showWhen: { field: 'category', equals: 'other' },
      required: true,
    },
    { name: 'details', label: 'What happened?', type: 'textarea', required: true, minLength: 10 },
  ],
};
export const surveyForm: FormSchema = {
  id: 'survey',
  title: 'A short feedback survey',
  submitLabel: 'Preview responses',
  fields: [
    {
      name: 'experience',
      label: 'How was your experience?',
      type: 'select',
      required: true,
      options: [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Could be better', value: 'improve' },
      ],
    },
    {
      name: 'improvement',
      label: 'What could we improve?',
      type: 'textarea',
      required: true,
      showWhen: { field: 'experience', equals: 'improve' },
    },
    { name: 'recommend', label: 'Would you recommend us?', type: 'checkbox' },
    { name: 'comments', label: 'Anything else?', type: 'textarea' },
  ],
};
export const demoSection: SectionData = {
  eyebrow: 'A foundation for your business',
  title: 'Lorem ipsum, thoughtfully done.',
  description: lorem,
  image: demoImages[0],
  images: demoImages,
  actions: [
    { type: 'anchor', href: '#contact', label: 'Get in touch', intent: 'primary' },
    { type: 'anchor', href: '#services', label: 'Explore our services', intent: 'text' },
  ],
  services: Array.from({ length: 3 }, (_, i) => ({
    id: `service-${i}`,
    slug: `service-${i}`,
    name: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur elit'][i]!,
    summary: lorem,
    icon: ['shield', 'clock', 'info'][i],
    image: demoImages[i],
    actions: [
      {
        type: 'route' as const,
        to: `/services/service-${i}`,
        label: 'Learn more',
        intent: 'text' as const,
      },
    ],
  })),
  features: Array.from({ length: 3 }, (_, i) => ({
    id: `feature-${i}`,
    title: ['Clear communication', 'Thoughtful approach', 'Lasting relationships'][i]!,
    description: lorem,
    icon: ['email', 'shield', 'clock'][i],
    image: demoImages[i],
  })),
  steps: Array.from({ length: 3 }, (_, i) => ({
    id: `step-${i}`,
    number: i + 1,
    title: ['A conversation', 'A considered plan', 'Moving forward'][i]!,
    description: lorem,
  })),
  team: Array.from({ length: 3 }, (_, i) => ({
    id: `member-${i}`,
    name: `Lorem Ipsum ${i + 1}`,
    role: 'Example role',
    summary: lorem,
    biography: lorem,
    image: demoImages[2],
    credentials: ['Example qualification'],
  })),
  testimonials: [
    {
      id: 'review-1',
      content:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.”',
      author: { name: 'Lorem Ipsum', role: 'Example client' },
      rating: { value: 5, scale: 5 },
    },
    {
      id: 'review-2',
      content: lorem,
      author: { name: 'Dolor Sit', role: 'Example client' },
      rating: { value: 4, scale: 5 },
    },
  ],
  faqs: Array.from({ length: 4 }, (_, i) => ({
    id: `faq-${i}`,
    question: [
      'What can I expect when we get started?',
      'How do you approach a new project?',
      'Can I ask a few questions first?',
      'Where can I find more information?',
    ][i]!,
    answer: lorem,
    categoryId: i < 2 ? 'general' : 'process',
  })),
  categories: [
    { id: 'general', name: 'General' },
    { id: 'process', name: 'Our process' },
  ],
  stats: [
    {
      id: 'stat-1',
      value: '12',
      suffix: '+',
      label: 'Example years',
      description: 'Illustrative statistic only.',
    },
    {
      id: 'stat-2',
      value: '240',
      suffix: '+',
      label: 'Example projects',
      description: 'Illustrative statistic only.',
    },
    {
      id: 'stat-3',
      value: '98',
      suffix: '%',
      label: 'Example satisfaction',
      description: 'Illustrative statistic only.',
    },
  ],
  trust: ['Lorem', 'Ipsum', 'Dolor', 'Amet'].map((name, i) => ({
    id: `trust-${i}`,
    name,
    description: 'Illustrative organization. Replace with real, verified information.',
    icon: 'shield',
    issuer: 'Example organization',
    year: '2026',
  })),
  plans: ['Essential', 'Considered', 'Complete'].map((name, i) => ({
    id: `plan-${i}`,
    name,
    price: `$${[49, 99, 149][i]}`,
    period: '/ month',
    description: lorem,
    features: ['Lorem ipsum dolor', 'Consectetur adipiscing', 'Personal support'],
    featured: i === 1,
    action: { type: 'anchor' as const, href: '#contact', label: 'Ask about this plan' },
  })),
  resources: [
    {
      id: 'resource-1',
      title: 'An introduction to our approach',
      description: lorem,
      fileType: 'PDF',
      fileSize: '1 KB',
      action: {
        type: 'download',
        href: '/example-guide.pdf',
        label: 'Download example guide (PDF)',
      },
    },
  ],
  articles: Array.from({ length: 3 }, (_, i) => ({
    id: `article-${i}`,
    slug: `article-${i}`,
    title: [
      'A thoughtful place to begin',
      'The value of a clear process',
      'Building something that lasts',
    ][i]!,
    excerpt: lorem,
    image: demoImages[i],
    publishedAt: '2026-01-15',
    readingTimeMinutes: 4,
    author: { name: 'Lorem Ipsum' },
    tags: [{ id: 'ideas', name: 'Ideas', slug: 'ideas' }],
  })),
  locations: [
    {
      id: 'main',
      name: 'Example location',
      primary: true,
      timezone: 'America/Denver',
      address: {
        line1: '123 Example Street',
        locality: 'Example City',
        region: 'CO',
        postalCode: '00000',
        countryCode: 'US',
      },
      contact: { phone: '+10000000000', email: 'hello@example.com' },
      hours: {
        regular: [
          { day: 'monday', periods: [{ opens: '09:00', closes: '17:00' }] },
          { day: 'tuesday', periods: [{ opens: '09:00', closes: '17:00' }] },
          { day: 'wednesday', periods: [{ opens: '09:00', closes: '17:00' }] },
          { day: 'thursday', periods: [{ opens: '09:00', closes: '17:00' }] },
          { day: 'friday', periods: [{ opens: '09:00', closes: '17:00' }] },
          { day: 'saturday', periods: [] },
          { day: 'sunday', periods: [] },
        ],
      },
    },
  ],
  areas: [{ name: 'Example region', localities: ['Lorem', 'Ipsum'] }],
  comparisons: [
    { label: 'Initial conversation', values: ['Included', 'Included', 'Included'] },
    { label: 'Dedicated support', values: ['Not included', 'Included', 'Included'] },
    { label: 'Custom planning', values: ['Not included', 'Optional', 'Included'] },
  ],
  beforeAfter: [{ before: demoImages[0]!, after: demoImages[1]! }],
  form: contactForm,
};
export const demoArticle: Article = {
  ...demoSection.articles![0]!,
  content: `${lorem}\n\n${lorem}\n\n${lorem}`,
};
