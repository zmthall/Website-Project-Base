<script setup lang="ts">
import type { DeepReadonly } from 'vue';
import { isFeaturePathEnabled } from '#shared/utils/features';
import type { Action } from '../../../shared/types/action';
defineOptions({ inheritAttrs: false });
const props = defineProps<{ action: DeepReadonly<Action>; button?: boolean }>();
const { resolveAction } = useNavigation();
const link = computed(() => resolveAction(props.action));
const site = useSiteConfig();
const available = computed(
  () => !link.value.href || isFeaturePathEnabled(site.features, link.value.href),
);
</script>
<template>
  <template v-if="available">
    <span v-bind="$attrs" v-if="link.disabled" aria-disabled="true" :class="{ btn: button }">
      <slot>{{ action.label }}</slot>
    </span>
    <NuxtLink
      v-bind="$attrs"
      v-else-if="link.to"
      :to="link.to"
      :class="{ btn: button }"
      :data-variant="action.intent ?? 'primary'"
    >
      <slot>{{ action.label }}</slot>
    </NuxtLink>
    <a
      v-bind="$attrs"
      v-else
      :href="link.href"
      :target="link.target"
      :rel="link.rel"
      :download="link.download"
      :class="{ btn: button }"
      :data-variant="action.intent ?? 'primary'"
    >
      <slot>{{ action.label }}</slot>
    </a>
  </template>
</template>
