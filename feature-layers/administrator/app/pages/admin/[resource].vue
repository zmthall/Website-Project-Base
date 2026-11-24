<script setup lang="ts">
import { resourceIsEnabled, resourceKinds, resources } from '#shared/data/management';
import type { ResourceKind } from '#shared/types/management';

const route = useRoute();
const kind = String(route.params.resource) as ResourceKind;
const site = useSiteConfig();
if (!resourceKinds.includes(kind) || !resourceIsEnabled(kind, site.features))
  throw createError({ statusCode: 404, statusMessage: 'Management resource not found' });
useSEO({ title: `${resources[kind].title} administration`, robots: { index: false, follow: false } });
</script>

<template>
  <div class="container section"><AdminResourceManager :kind="kind" /></div>
</template>
