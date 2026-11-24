// TODO [SEARCH-01]: Keep provider credentials server-only if this request-time local source is replaced with hosted search. See docs/integration-audit.md.
import { demoSection } from '../../../../app/data/demo';
import { site } from '../../../../shared/data/site';
import { isFeaturePathEnabled } from '../../../../shared/utils/features';
import { managementStore } from '../../../../server/utils/management-store';
import { blogStore } from '../../../blog/server/utils/blog-store';
import { createDemoEvents, eventToday } from '../../../events/app/features/events/demo';
import { eventRepository } from '../../../events/server/repositories/events';
import { newsletter } from '../../../newsletter/app/data/newsletter';
import { createSearchDocuments } from './search-index';

const publicPages = [
  { id: 'home', title: site.name, description: site.seo.description, path: '/' },
  {
    id: 'about',
    title: 'About us',
    description: 'Learn about our people and approach.',
    path: '/about',
  },
  {
    id: 'services',
    title: 'Services',
    description: 'Explore the services we offer.',
    path: '/services',
  },
  {
    id: 'faq',
    title: 'Frequently asked questions',
    description: 'Answers to common questions.',
    path: '/faq',
  },
  {
    id: 'articles',
    title: 'Articles and resources',
    description: 'Ideas and practical resources.',
    path: '/articles',
  },
  {
    id: 'blog',
    title: 'Blog',
    description: 'News, ideas, and stories from our team.',
    path: '/blog',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Community gatherings, workshops, and conversations.',
    path: '/events',
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Published news and updates.',
    path: '/newsletter',
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Published customer experiences.',
    path: '/reviews',
  },
  {
    id: 'careers',
    title: 'Careers',
    description: 'Open positions and ways to join the team.',
    path: '/careers',
  },
  {
    id: 'contact',
    title: 'Contact',
    description: 'Start a conversation with our team.',
    path: '/contact',
  },
  {
    id: 'appointments',
    title: 'Appointments',
    description: 'Request and manage an appointment.',
    path: '/appointments',
  },
  {
    id: 'estimates',
    title: 'Estimates',
    description: 'Request an estimate for your project.',
    path: '/estimates',
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    description: 'How website information is handled.',
    path: '/privacy',
  },
  {
    id: 'terms',
    title: 'Terms of use',
    description: 'Terms that apply when using this website.',
    path: '/terms',
  },
];

export async function localSearchDocuments() {
  const pages = [
    ...publicPages,
    ...(demoSection.services ?? []).map((service) => ({
      id: service.id,
      title: service.name,
      description: service.summary,
      path: `/services/${service.slug}`,
      category: 'service',
    })),
  ].filter((page) => isFeaturePathEnabled(site.features, page.path));
  const articles = (demoSection.articles ?? []).map((article) => ({
    id: article.id,
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    category: article.tags?.map(({ name }) => name).join(', ') || undefined,
    publishedAt: article.publishedAt,
  }));
  const newsletters = site.features.newsletter ? managementStore().list('newsletters') : [];
  const now = Date.now();
  const hasPublishedNewsletter = newsletters.some((issue) => {
    if (issue.fields.status !== 'published') return false;
    const publishedAt = String(issue.fields.publishedAt || '');
    return (
      !publishedAt || (Number.isFinite(Date.parse(publishedAt)) && Date.parse(publishedAt) <= now)
    );
  });
  const news =
    site.features.newsletter && !hasPublishedNewsletter
      ? newsletter.stories.map((story) => ({
          id: story.id,
          title: story.title,
          description: story.summary,
          path: `/newsletter#${story.id}`,
          category: story.category,
        }))
      : [];
  const storedEvents = site.features.events ? await eventRepository.list() : [];
  const publishedEvents = storedEvents.filter((event) => event.fields.status === 'published');
  const events =
    site.features.events && !publishedEvents.length
      ? createDemoEvents(eventToday()).map((event) => ({
          id: event.id,
          version: 'sample',
          createdAt: `${event.date}T00:00:00.000Z`,
          updatedAt: `${event.date}T00:00:00.000Z`,
          fields: { ...event, status: 'published' },
        }))
      : publishedEvents;

  return createSearchDocuments({
    pages,
    articles,
    news,
    blogPosts: site.features.blog ? await blogStore().list(true) : [],
    newsletters,
    events,
  });
}
