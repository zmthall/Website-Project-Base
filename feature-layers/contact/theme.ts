import { defineAsyncComponent, type Component } from 'vue';

export const contactSectionRegistry: Record<
  string,
  { family: string; variant: string; label: string; component: Component }
> = {
  'contact-split': {
    family: 'contact',
    variant: 'split',
    label: 'Contact / Split',
    component: defineAsyncComponent(() => import('./app/components/sections/contact/Split.vue')),
  },
  'contact-simple': {
    family: 'contact',
    variant: 'simple',
    label: 'Contact / Simple',
    component: defineAsyncComponent(() => import('./app/components/sections/contact/Simple.vue')),
  },
  'contact-withmap': {
    family: 'contact',
    variant: 'withmap',
    label: 'Contact / WithMap',
    component: defineAsyncComponent(() => import('./app/components/sections/contact/WithMap.vue')),
  },
  'contact-locations': {
    family: 'contact',
    variant: 'locations',
    label: 'Contact / Locations',
    component: defineAsyncComponent(() => import('./app/components/sections/contact/Locations.vue')),
  },
};
