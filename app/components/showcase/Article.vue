<script setup lang="ts">
import { demoArticle, lorem, demoSection, demoImages } from '../../data/demo';
import type { ContentBlock } from '../../types/content';
const blocks: ContentBlock[] = [
  { type: 'heading', id: 'article-introduction', level: 2, text: 'A clear introduction' },
  { type: 'paragraph', text: lorem },
  { type: 'list', items: ['Lorem ipsum dolor', 'Consectetur adipiscing', 'Sed do eiusmod'] },
  { type: 'quote', text: lorem, attribution: 'Lorem Ipsum' },
  { type: 'heading', id: 'article-details', level: 2, text: 'A little more detail' },
  {
    type: 'table',
    caption: 'Example comparison',
    headers: ['Option', 'Description'],
    rows: [
      ['First', 'Lorem ipsum'],
      ['Second', 'Dolor sit amet'],
    ],
  },
  { type: 'code', text: 'const theme = "foundation";' },
  { type: 'image', image: demoImages[1]! },
];
</script>
<template>
  <div class="stack">
    <ArticleHeader :heading-level="3" :article="demoArticle" />
    <ArticleTOC
      :headings="[
        { id: 'article-introduction', text: 'A clear introduction', level: 2 },
        { id: 'article-details', text: 'A little more detail', level: 2 },
      ]"
    />
    <ArticleContent :blocks="blocks" />
    <ArticleAuthor :author="demoArticle.author!" :biography="lorem" />
    <ArticleTags :tags="demoArticle.tags" />
    <ArticleShare url="https://www.example.com/articles/article-0" :title="demoArticle.title" />
    <ArticleRelated :articles="demoSection.articles!" />
  </div>
</template>
