import { newsletter as sample } from '#shared/data/newsletter';
import type { ManagedRecord } from '#shared/types/management';
export async function useNewsletterContent() {
  const enabled = useFeature('newsletter');
  const { data: issues } = await useFetch<ManagedRecord[]>('/api/content/newsletters', {
    key: 'newsletter-content',
    immediate: enabled.value,
  });
  const newsletter = computed(() => {
    const issue = issues.value?.[0];
    return issue
      ? {
          ...sample,
          title: String(issue.fields.title),
          issue: String(issue.fields.issue),
          introduction: String(issue.fields.summary),
          bannerText: `Read our latest newsletter: ${issue.fields.title}`,
          stories: [
            {
              id: issue.id,
              category: 'Latest issue',
              title: String(issue.fields.title),
              summary: String(issue.fields.summary),
              body: '',
            },
          ],
        }
      : sample;
  });
  return { newsletter, illustrative: computed(() => !issues.value?.length) };
}
