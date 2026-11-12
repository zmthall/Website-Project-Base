<script setup lang="ts">
import type { ContentBlock } from '../../types/content';
defineProps<{ content?: string; blocks?: ContentBlock[] }>();
</script>
<template>
  <div class="prose">
    <template v-if="blocks">
      <template v-for="(block, index) in blocks" :key="index">
        <p v-if="block.type === 'paragraph'">{{ block.text }}</p>
        <ContentHeading v-else-if="block.type === 'heading'" :id="block.id" :level="block.level">
          {{ block.text }}
        </ContentHeading>
        <ContentList
          v-else-if="block.type === 'list'"
          :items="block.items"
          :ordered="block.ordered"
        />
        <ContentQuote
          v-else-if="block.type === 'quote'"
          :text="block.text"
          :attribution="block.attribution"
        />
        <pre
          v-else-if="block.type === 'code'"
          style="overflow: auto; padding: 1rem; background: var(--panel)"
        ><code>{{block.text}}</code></pre>
        <ContentImage v-else-if="block.type === 'image'" :image="block.image" />
        <BaseLink v-else-if="block.type === 'link'" :action="block.action" />
        <div v-else-if="block.type === 'table'" class="table-wrap">
          <table>
            <caption>
              {{ block.caption }}
            </caption>
            <thead>
              <tr>
                <th v-for="header in block.headers" :key="header" scope="col">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in block.rows" :key="i">
                <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
    <template v-else>
      <p v-for="(paragraph, index) in (content ?? '').split(/\n\s*\n/)" :key="index">
        {{ paragraph }}
      </p>
    </template>
    <slot />
  </div>
</template>
