<script setup lang="ts">
// TODO [FORMS-01]: Extend runtime field/length/date/locale validation and shared-control parity; repeat every relevant check server-side and retain accessible error/focus behavior for async submissions. See docs/integration-audit.md.

import type { FormSchema, FormValue } from '../../types/forms';
import { visibleFields, validateFields } from '../../utils/forms';
const props = defineProps<{ schema: FormSchema; busy?: boolean }>();
const emit = defineEmits<{ submit: [values: Record<string, FormValue>] }>();
const values = reactive<Record<string, FormValue>>({});
const errors = ref<Record<string, string>>({});
const summary = ref<HTMLElement>();
const fields = computed(() => visibleFields(props.schema.fields, values));
watch(
  () => props.schema.id,
  () => {
    Object.keys(values).forEach((k) => Reflect.deleteProperty(values, k));
    errors.value = {};
  },
);
async function submit() {
  if (props.busy) return;
  errors.value = validateFields(props.schema.fields, values);
  if (Object.keys(errors.value).length) {
    await nextTick();
    summary.value?.focus();
    return;
  }
  emit('submit', Object.fromEntries(fields.value.map((f) => [f.name, values[f.name] ?? ''])));
}
const instance = useId();
function id(name: string) {
  return `${instance}-${name}`;
}
</script>
<template>
  <form class="stack" :aria-busy="busy" novalidate @submit.prevent="submit">
    <div>
      <h3>{{ schema.title }}</h3>
      <p v-if="schema.description" class="muted">{{ schema.description }}</p>
    </div>
    <div v-if="Object.keys(errors).length" ref="summary" tabindex="-1" class="alert" role="alert">
      <strong>Please check the following fields</strong>
      <ul>
        <li v-for="(error, key) in errors" :key="key">
          <a :href="`#${id(String(key))}`">
            {{ schema.fields.find((f) => f.name === key)?.label }}: {{ error }}
          </a>
        </li>
      </ul>
    </div>
    <template v-for="field in fields" :key="field.name">
      <fieldset
        v-if="field.type === 'radio'"
        :id="id(field.name)"
        class="stack"
        :aria-describedby="`${id(field.name)}-help`"
      >
        <legend class="label">{{ field.label }}{{ field.required ? ' *' : '' }}</legend>
        <label v-for="option in field.options" :key="option.value" class="check">
          <input
            :disabled="busy || option.disabled"
            v-model="values[field.name]"
            type="radio"
            :name="id(field.name)"
            :value="option.value"
            :required="field.required"
          />
          {{ option.label }}
        </label>
        <p :id="`${id(field.name)}-help`" :class="errors[field.name] ? 'error-text' : 'help'">
          {{ errors[field.name] ?? field.help }}
        </p>
      </fieldset>
      <div v-else class="field">
        <label :for="id(field.name)" class="label">
          {{ field.label }}{{ field.required ? ' *' : '' }}
        </label>
        <textarea
          :disabled="busy"
          v-if="field.type === 'textarea'"
          :id="id(field.name)"
          v-model="values[field.name] as string"
          class="input"
          :required="field.required"
          :aria-invalid="!!errors[field.name]"
          :aria-describedby="`${id(field.name)}-help`"
        />
        <select
          :disabled="busy"
          v-else-if="field.type === 'select'"
          :id="id(field.name)"
          v-model="values[field.name]"
          class="input"
          :required="field.required"
          :aria-invalid="!!errors[field.name]"
          :aria-describedby="`${id(field.name)}-help`"
        >
          <option value="">Select an option</option>
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>
        <input
          :disabled="busy"
          v-else-if="field.type === 'checkbox'"
          :id="id(field.name)"
          v-model="values[field.name]"
          type="checkbox"
          :required="field.required"
          :aria-invalid="!!errors[field.name]"
          :aria-describedby="`${id(field.name)}-help`"
        />
        <input
          :disabled="busy"
          v-else
          :id="id(field.name)"
          v-model="values[field.name]"
          class="input"
          :type="field.type"
          :placeholder="field.placeholder"
          :required="field.required"
          :min="field.min"
          :max="field.max"
          :minlength="field.minLength"
          :aria-invalid="!!errors[field.name]"
          :aria-describedby="`${id(field.name)}-help`"
        />
        <p :id="`${id(field.name)}-help`" :class="errors[field.name] ? 'error-text' : 'help'">
          {{ errors[field.name] ?? field.help }}
        </p>
      </div>
    </template>
    <div>
      <BaseButton type="submit" :loading="busy">
        {{ schema.submitLabel ?? 'Submit example' }}
        <BaseIcon />
      </BaseButton>
    </div>
    <slot />
  </form>
</template>
