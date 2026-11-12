/**
 * FAQ Data
 *
 * Central source for frequently asked questions displayed throughout
 * the website.
 *
 * FAQ items may optionally reference a category using `categoryId`.
 * Visible FAQ content and FAQ structured data should originate from
 * this same source so search metadata remains consistent with the
 * content presented to users.
 *
 * Filtering, accordion state, expansion state, and presentation logic
 * do not belong in this file.
 */

import type { FAQCategory, FAQItem } from '../types/faq';

/**
 * Optional FAQ categories.
 *
 * Categories provide lightweight organization for larger FAQ
 * collections. FAQ items reference categories by their stable `id`.
 *
 * Remove unused categories rather than creating empty groups solely
 * for presentation purposes.
 */
export const faqCategories = [
  {
    id: 'general',
    name: 'General',
    description: 'General questions about our services and business.',
    order: 1,
  },

  {
    id: 'services',
    name: 'Services',
    description: 'Questions about our available services.',
    order: 2,
  },
] satisfies FAQCategory[];

/**
 * Frequently asked questions for the current website.
 *
 * Required fields:
 * - `id`
 * - `question`
 * - `answer`
 *
 * `categoryId` should correspond to an `FAQCategory.id` when a
 * categorized FAQ experience is required.
 */
export const faqs = [
  {
    id: 'general-question-one',

    question: 'What services do you offer?',

    answer:
      'Replace this answer with accurate information describing the services offered by the business.',

    categoryId: 'general',
    order: 1,
  },

  {
    id: 'general-question-two',

    question: 'What areas do you serve?',

    answer:
      'Replace this answer with accurate information about the geographic areas served by the business.',

    categoryId: 'general',
    order: 2,
  },

  {
    id: 'service-question-one',

    question: 'How do I get started with a service?',

    answer:
      'Replace this answer with accurate information explaining how customers can begin the service process.',

    categoryId: 'services',
    order: 3,
  },
] satisfies FAQItem[];
