/** Newsletter content and placement settings; ready for a future CMS/admin editor. */
export interface NewsletterStory {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string;
}

export const newsletter = {
  homepagePreview: true,
  topBanner: true,
  bannerText: 'A few good things to share. Explore our latest newsletter.',
  issue: 'Issue 01',
  title: 'Notes from our corner.',
  introduction:
    'A little inspiration, a look behind the scenes, and things worth sharing. This is a sample newsletter for the website template.',
  stories: [
    {
      id: 'small-details',
      category: 'Fresh perspective',
      title: 'Small details. Lasting impressions.',
      summary: 'A thoughtful approach to the little things that make everyday experiences better.',
      body: 'Good work starts with paying attention. In this example story, we explore how listening closely, asking useful questions, and taking care of the details can make a meaningful difference. Replace this sample with a story from your business.',
    },
    {
      id: 'behind-the-scenes',
      category: 'Behind the scenes',
      title: 'Meet the people behind the work.',
      summary: 'Take a closer look at the ideas and people shaping what comes next.',
      body: 'Every project brings a new opportunity to learn together. Share a team introduction, a recent milestone, or a glimpse into your process here. This sample is a place for the human side of your business.',
    },
    {
      id: 'whats-next',
      category: 'Looking ahead',
      title: 'Something good on the horizon.',
      summary: 'New conversations, fresh ideas, and a few things to look forward to.',
      body: 'Use this space to share upcoming news, useful resources, or plans for the months ahead. Keep the message clear and helpful, and give your readers a reason to return. All content in this issue is illustrative.',
    },
  ] satisfies NewsletterStory[],
};
