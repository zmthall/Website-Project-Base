<script setup lang="ts">
import type { FormSchema, FormValue } from '../../types/forms';
import { useFeatureRequest } from './useFeatureRequest';
const props = defineProps<{
  schema: FormSchema;
  submit: (values: Record<string, FormValue>, signal: AbortSignal) => Promise<unknown>;
  successMessage: string;
}>();
const request = useFeatureRequest((values: Record<string, FormValue>, signal) =>
  props.submit(values, signal),
);
const emit = defineEmits<{ success: [result: unknown] }>();
async function handleSubmit(values: Record<string, FormValue>) {
  if (request.status.value === 'loading') return;
  const result = await request.execute(values);
  if (request.status.value === 'success') emit('success', result);
}
</script>
<template>
  <div class="stack">
    <FormsDynamicForm
      :schema="schema"
      :busy="request.status.value === 'loading'"
      @submit="handleSubmit"
    />
    <SystemSuccessState v-if="request.status.value === 'success'" :message="successMessage" />
    <BaseAlert v-if="request.error.value" tone="danger" :title="request.error.value.message">
      <ul v-if="request.error.value.fieldErrors">
        <li v-for="(_, field) in request.error.value.fieldErrors" :key="field">
          Please check
          {{
            schema.fields.find((item) => item.name === field)?.label ?? 'the submitted information'
          }}.
        </li>
      </ul>
    </BaseAlert>
  </div>
</template>
