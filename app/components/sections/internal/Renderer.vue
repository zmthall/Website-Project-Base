<script setup lang="ts">
import type { SectionData } from '../../../types/sections';
const props = defineProps<{ family: string; variant: string; data: SectionData }>();
const emit = defineEmits<{
  submit: [values: Record<string, import('../../../types/forms').FormValue>];
}>();
const category = ref('all');
const selected = ref('');
const layout = computed(
  () =>
    ({
      imagegrid: 'grid',
      logocloud: 'bar',
      logos: 'bar',
      steps: 'grid',
      counter: 'grid',
      columns: 'grid',
      fullscreen: 'grid',
      simple: 'grid',
      recent: 'grid',
      certifications: 'grid',
      awards: 'grid',
      badges: 'grid',
      partners: 'grid',
      associations: 'grid',
      clients: 'grid',
      casestudies: 'grid',
      withmap: 'split',
      locations: 'grid',
      withform: 'split',
      comparison: 'grid',
      flipcard: 'grid',
      stats: 'grid',
      downloads: 'grid',
      results: 'grid',
      servicearea: 'grid',
    })[props.variant] ?? props.variant,
);
const filteredFAQ = computed(() =>
  (props.data.faqs ?? []).filter(
    (f) => category.value === 'all' || f.categoryId === category.value,
  ),
);
const currentLocation = computed(
  () => props.data.locations?.find((l) => l.id === selected.value) ?? props.data.locations?.[0],
);
const limit = computed(() => props.data.limit ?? 12);
const isCentered = computed(() => ['centered', 'minimal'].includes(props.variant));
</script>
<template>
  <section
    :id="data.id"
    class="section"
    :class="{
      surface: variant === 'banner' || variant === 'background',
      'trust-bar': family === 'trust' && variant === 'bar',
    }"
    :style="data.columns ? { '--section-columns': data.columns } : undefined"
    :data-media-first="data.mediaFirst || undefined"
    :data-family="family"
    :data-variant="variant"
  >
    <div class="container">
      <template v-if="family === 'hero'">
        <MediaBackgroundImage
          v-if="variant === 'background' && data.image"
          :image="{ ...data.image, loading: 'eager', fetchPriority: 'high' }"
        >
          <div class="hero-copy" style="padding: 3rem">
            <p class="eyebrow">{{ data.eyebrow }}</p>
            <component :is="`h${data.headingLevel ?? 1}`">{{ data.title }}</component>
            <p style="color: inherit">{{ data.description }}</p>
            <ContentCTA v-if="data.actions" :actions="data.actions" />
          </div>
        </MediaBackgroundImage>
        <div v-else :class="isCentered ? 'centered' : 'hero-layout'">
          <div class="hero-copy" :class="{ centered: isCentered }">
            <ContentEyebrow>{{ data.eyebrow }}</ContentEyebrow>
            <component :is="`h${data.headingLevel ?? 1}`">{{ data.title }}</component>
            <p>{{ data.description }}</p>
            <ContentCTA v-if="data.actions" :actions="data.actions" :centered="isCentered" />
          </div>
          <FormsDynamicForm
            v-if="variant === 'withform' && data.form"
            :schema="data.form"
            @submit="emit('submit', $event)"
          />
          <ContentVideo v-else-if="variant === 'video' && data.video" :video="data.video" />
          <div v-else-if="data.image && variant !== 'minimal'" class="hero-media">
            <MediaAppImage :image="{ ...data.image, loading: 'eager', fetchPriority: 'high' }" />
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-if="!(family === 'trust' && variant === 'bar')"
          class="section-heading"
          :class="{ centered: isCentered }"
        >
          <ContentEyebrow v-if="data.eyebrow">{{ data.eyebrow }}</ContentEyebrow>
          <component :is="`h${data.headingLevel ?? 2}`">{{ data.title }}</component>
          <p v-if="data.description">{{ data.description }}</p>
        </div>
        <SystemLoadingState v-if="data.loading" />
        <SystemErrorState v-else-if="data.error" :message="data.error" />
        <template v-else-if="family === 'faq'">
          <label
            v-if="variant === 'categorized'"
            class="field"
            style="max-width: 20rem; margin-bottom: 1rem"
          >
            Category
            <select v-model="category" class="input">
              <option value="all">All questions</option>
              <option v-for="item in data.categories" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </label>
          <div v-if="variant === 'columns'" class="grid grid-2">
            <article v-for="faq in filteredFAQ" :key="faq.id" class="stack">
              <h3>{{ faq.question }}</h3>
              <p>{{ faq.answer }}</p>
            </article>
          </div>
          <BaseAccordion
            v-else
            :items="filteredFAQ.map((f) => ({ id: f.id, title: f.question, content: f.answer }))"
          />
          <BaseEmptyState v-if="!filteredFAQ.length" title="No questions in this category" />
        </template>
        <template v-else-if="family === 'gallery'">
          <div v-if="variant === 'beforeafter'" class="grid grid-2">
            <MediaBeforeAfter
              v-for="(pair, index) in data.beforeAfter"
              :key="index"
              v-bind="pair"
            />
          </div>
          <BaseCarousel
            v-else-if="variant === 'carousel'"
            :items="(data.images ?? []).map((image, i) => ({ id: String(i), title: image.alt }))"
            label="Image gallery"
          >
            <template #default="{ index }"><ContentImage :image="data.images![index]!" /></template>
          </BaseCarousel>
          <div v-else-if="variant === 'masonry'" class="section-layout" data-layout="masonry">
            <ContentImage v-for="image in data.images" :key="image.src" :image="image" />
          </div>
          <MediaImageGallery
            v-else
            :images="data.images ?? []"
            :limit="limit"
            :class="{ 'gallery-full': variant === 'fullscreen' }"
          />
        </template>
        <template v-else-if="family === 'contact'">
          <div class="section-layout" :data-layout="layout">
            <div class="stack">
              <BusinessContactMethods />
              <template v-if="variant === 'locations'">
                <BlocksLocationCard
                  v-for="location in data.locations"
                  :key="location.id"
                  :location="location"
                />
              </template>
              <BusinessMap
                v-if="variant === 'withmap' && currentLocation"
                :location="currentLocation"
              />
              <ContentCTA v-if="data.actions" :actions="data.actions" />
            </div>
            <FormsDynamicForm
              v-if="data.form && variant !== 'simple' && variant !== 'locations'"
              :schema="data.form"
              @submit="emit('submit', $event)"
            />
          </div>
        </template>
        <template v-else-if="family === 'locations'">
          <BusinessServiceArea v-if="variant === 'servicearea'" :areas="data.areas ?? []" />
          <div v-else-if="variant === 'map'" class="grid grid-2">
            <div class="stack">
              <BusinessLocationSelector v-model="selected" :locations="data.locations ?? []" />
              <BusinessLocation v-if="currentLocation" :location="currentLocation" />
            </div>
            <BusinessMap v-if="currentLocation" :location="currentLocation" />
          </div>
          <div v-else class="grid grid-3">
            <BlocksLocationCard
              v-for="location in data.locations"
              :key="location.id"
              :location="location"
            />
          </div>
        </template>
        <template v-else-if="family === 'newsletter'">
          <FormsDynamicForm v-if="data.form" :schema="data.form" @submit="emit('submit', $event)" />
          <p v-else class="muted">
            Provide a subscription form through this section’s form configuration.
          </p>
        </template>
        <template
          v-else-if="family === 'comparison' || (family === 'pricing' && variant === 'comparison')"
        >
          <div v-if="variant === 'table' || variant === 'comparison'" class="table-wrap">
            <table>
              <caption>
                {{ data.title }}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th v-for="plan in data.plans" :key="plan.id" scope="col">{{ plan.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in data.comparisons" :key="row.label">
                  <th scope="row">{{ row.label }}</th>
                  <td v-for="(value, i) in row.values" :key="i">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="grid grid-3">
            <BaseCard v-for="(plan, index) in data.plans" :key="plan.id">
              <h3>{{ plan.name }}</h3>
              <p v-for="row in data.comparisons" :key="row.label">
                {{ row.label }}: {{ row.values[index] }}
              </p>
            </BaseCard>
          </div>
        </template>
        <template v-else-if="family === 'about' || family === 'cta'">
          <div
            :class="[
              'section-layout',
              { card: variant === 'floating' || variant === 'pleasenote', centered: isCentered },
            ]"
            :data-layout="layout"
            :style="variant === 'floating' ? { boxShadow: 'var(--shadow)' } : undefined"
          >
            <template v-if="variant === 'timeline'">
              <ol class="stack">
                <li v-for="step in data.steps" :key="step.id">
                  <BlocksProcessStep :step="step" />
                </li>
              </ol>
            </template>
            <template v-else>
              <ContentRichText :content="data.description" />
              <MediaImageGallery v-if="variant === 'imagegrid'" :images="data.images ?? []" />
              <MediaAppImage v-else-if="data.image && variant === 'split'" :image="data.image" />
            </template>
          </div>
          <ContentCTA
            v-if="data.actions"
            :actions="data.actions"
            :centered="isCentered"
            style="margin-top: 2rem"
          />
        </template>
        <BaseCarousel
          v-else-if="family === 'testimonials' && variant === 'carousel'"
          :items="(data.testimonials ?? []).map((t) => ({ id: t.id, title: t.author.name }))"
          label="Testimonials"
        >
          <template #default="{ index }">
            <BlocksReviewCard :review="data.testimonials![index]!" />
          </template>
        </BaseCarousel>
        <template v-else-if="family === 'process'">
          <ol class="section-layout" :data-layout="layout">
            <li v-for="step in data.steps" :key="step.id">
              <BlocksProcessStep
                :step="{ ...step, number: variant === 'numbered' ? step.number : undefined }"
              />
            </li>
          </ol>
        </template>
        <div
          v-else
          class="section-layout"
          :data-layout="layout"
          :class="{
            'featured-grid': variant === 'featured',
            'alternating-grid': variant === 'alternating',
            'compact-grid': variant === 'grid',
          }"
        >
          <template v-if="family === 'services'">
            <template v-for="service in data.services?.slice(0, limit)" :key="service.id">
              <details v-if="variant === 'flipcard'" class="card">
                <summary>
                  <h3 style="display: inline">{{ service.name }}</h3>
                </summary>
                <div class="stack" style="margin-top: 1rem">
                  <p>{{ service.description ?? service.summary }}</p>
                  <ContentCTA :actions="service.actions ?? []" />
                </div>
              </details>
              <BlocksServiceCard
                v-else
                :service="variant === 'icons' ? { ...service, image: undefined } : service"
              />
            </template>
          </template>
          <BlocksFeatureCard
            v-else-if="family === 'features'"
            v-for="feature in data.features?.slice(0, limit)"
            :key="feature.id"
            :feature="variant === 'icons' ? { ...feature, image: undefined } : feature"
          />
          <BlocksTeamCard
            v-else-if="family === 'team'"
            v-for="member in data.team?.slice(0, limit)"
            :key="member.id"
            :member="member"
            :expanded="variant === 'featured'"
          />
          <BlocksReviewCard
            v-else-if="family === 'testimonials'"
            v-for="review in data.testimonials?.slice(0, variant === 'featured' ? 1 : limit)"
            :key="review.id"
            :review="review"
            :featured="variant === 'featured'"
          />
          <ArticleCard
            v-else-if="family === 'articles'"
            v-for="article in data.articles?.slice(0, limit)"
            :key="article.id"
            :article="article"
          />
          <BlocksPricingCard
            v-else-if="family === 'pricing'"
            v-for="plan in data.plans?.slice(0, variant === 'simple' ? 1 : limit)"
            :key="plan.id"
            :plan="plan"
          />
          <BlocksStatCard
            v-else-if="family === 'stats' || (family === 'trust' && variant === 'stats')"
            v-for="stat in data.stats"
            :key="stat.id"
            :stat="stat"
            :animate="variant === 'counter'"
          />
          <template v-else-if="family === 'trust'">
            <template v-if="variant === 'awards'">
              <BlocksAwardCard v-for="item in data.trust" :key="item.id" :award="item" />
            </template>
            <BlocksTrustItem
              v-else
              v-for="item in data.trust"
              :key="item.id"
              :item="item"
              :compact="['bar', 'logos', 'logocloud'].includes(variant)"
            />
          </template>
          <template
            v-else-if="family === 'resources' || family === 'downloads' || family === 'search'"
          >
            <BaseCard v-for="resource in data.resources?.slice(0, limit)" :key="resource.id">
              <MediaAppImage v-if="resource.image" :image="resource.image" />
              <h3>{{ resource.title }}</h3>
              <p class="muted">{{ resource.description }}</p>
              <p v-if="resource.fileType" class="help">
                {{ resource.fileType }} · {{ resource.fileSize }}
              </p>
              <BaseLink v-if="resource.action" :action="resource.action" />
            </BaseCard>
            <BaseEmptyState
              v-if="!data.resources?.length"
              :title="data.emptyMessage ?? 'No results found'"
            />
          </template>
        </div>
        <p v-if="family === 'search'" role="status" class="help">
          {{ data.resources?.length ?? 0 }} results
        </p>
        <slot />
      </template>
    </div>
  </section>
</template>
