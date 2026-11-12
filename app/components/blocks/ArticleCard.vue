<script setup lang="ts">
import type { ArticleSummary } from '../../../shared/types/article';
defineProps<{ article: ArticleSummary }>();
</script>
<template><ArticleCard :article="article" /></template>
