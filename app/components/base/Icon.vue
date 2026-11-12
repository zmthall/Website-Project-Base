<script setup lang="ts">
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconMenu2,
  IconPlus,
  IconMinus,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconPhone,
  IconMail,
  IconMapPin,
  IconSun,
  IconMoon,
  IconStar,
  IconDownload,
  IconInfoCircle,
  IconShieldCheck,
  IconClock,
  IconCircle,
} from '@tabler/icons-vue';
const props = withDefaults(defineProps<{ name?: string; size?: number; label?: string }>(), {
  name: 'arrow-right',
  size: 20,
});
const icons: Record<string, typeof IconArrowRight> = {
  'arrow-right': IconArrowRight,
  'arrow-left': IconArrowLeft,
  check: IconCheck,
  close: IconX,
  menu: IconMenu2,
  plus: IconPlus,
  minus: IconMinus,
  'chevron-down': IconChevronDown,
  'chevron-right': IconChevronRight,
  search: IconSearch,
  phone: IconPhone,
  email: IconMail,
  location: IconMapPin,
  sun: IconSun,
  moon: IconMoon,
  star: IconStar,
  download: IconDownload,
  info: IconInfoCircle,
  shield: IconShieldCheck,
  clock: IconClock,
};
const icon = computed(() => icons[props.name] ?? IconCircle);
</script>
<template>
  <component
    :is="icon"
    :size="size"
    :stroke-width="1.5"
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
    :role="label ? 'img' : undefined"
  />
</template>
