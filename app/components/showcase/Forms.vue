<script setup lang="ts">
import { contactForm, issueForm, surveyForm } from '../../data/demo';
import type { FormValue } from '../../types/forms';
const chosen = ref('contact');
const schemas = { contact: contactForm, issue: issueForm, survey: surveyForm };
const schema = computed(() => schemas[chosen.value as keyof typeof schemas]);
const output = ref<Record<string, FormValue>>();
const text = ref<string | number>(''),
  area = ref(''),
  check = ref(false),
  select = ref(''),
  multi = ref<string[]>([]),
  range = ref(50),
  rating = ref(''),
  signature = ref(''),
  files = ref<File[]>([]);
const controls = reactive<Record<string, string | number>>({
  email: '',
  phone: '',
  url: '',
  number: '',
  date: '',
  time: '',
  search: '',
  currency: '',
});
const dates = ref({ start: '', end: '' });
const address = ref({ line1: '', locality: '', countryCode: '' });
const options = [
  { label: 'First option', value: 'first' },
  { label: 'Second option', value: 'second' },
  { label: 'Unavailable', value: 'disabled', disabled: true },
];
</script>
<template>
  <div class="stack">
    <div class="grid grid-2">
      <div class="stack">
        <label class="field">
          Form example
          <select v-model="chosen" class="input" @change="output = undefined">
            <option value="contact">Contact</option>
            <option value="issue">Report an issue</option>
            <option value="survey">Buildable survey</option>
          </select>
        </label>
        <FormsDynamicForm :schema="schema" @submit="output = $event" />
      </div>
      <div>
        <BaseAlert title="Local demonstration">
          These forms validate locally. Nothing is sent or stored on a server.
        </BaseAlert>
        <SystemSuccessState
          v-if="output"
          title="Example validated"
          message="The values below are the local form result."
          style="margin-top: 1rem"
        />
        <pre
          v-if="output"
          style="white-space: pre-wrap; overflow-wrap: anywhere; margin-top: 1rem"
          >{{ JSON.stringify(output, null, 2) }}</pre>
      </div>
    </div>
    <BaseDivider />
    <h3>Individual controls</h3>
    <div class="grid grid-2">
      <FormsField label="Text input" help="A short supporting description." v-slot="field">
        <FormsInput
          :id="field.id"
          v-model="text"
          :aria-describedby="field.describedBy"
          placeholder="Lorem ipsum"
        />
      </FormsField>
      <FormsField label="Email address" v-slot="field">
        <FormsEmail :id="field.id" v-model="controls.email!" placeholder="hello@example.com" />
      </FormsField>
      <FormsField label="Phone" v-slot="field">
        <FormsPhone :id="field.id" v-model="controls.phone!" />
      </FormsField>
      <FormsField label="Website URL" v-slot="field">
        <FormsURL :id="field.id" v-model="controls.url!" />
      </FormsField>
      <FormsField label="Number" v-slot="field">
        <FormsNumber :id="field.id" v-model="controls.number!" />
      </FormsField>
      <FormsField label="Date" v-slot="field">
        <FormsDate :id="field.id" v-model="controls.date!" />
      </FormsField>
      <FormsField label="Time" v-slot="field">
        <FormsTime :id="field.id" v-model="controls.time!" />
      </FormsField>
      <FormsField label="Search" v-slot="field">
        <FormsSearch :id="field.id" v-model="controls.search!" />
      </FormsField>
      <FormsField label="Select" v-slot="field">
        <FormsSelect
          :id="field.id"
          v-model="select"
          :options="options"
          placeholder="Choose an option"
        />
      </FormsField>
      <FormsCombobox v-model="select" label="Searchable suggestions" :options="options" />
      <FormsField label="Message" v-slot="field">
        <FormsTextarea :id="field.id" v-model="area" />
      </FormsField>
      <div class="stack">
        <FormsCheckbox v-model="check" label="Checkbox example" />
        <FormsSwitch v-model="check" label="Switch example" />
        <FormsAttestation v-model="check" />
      </div>
      <FormsRadio v-model="select" label="Choose one" :options="options" />
      <FormsMultiSelect v-model="multi" label="Choose several" :options="options" />
      <FormsRange v-model="range" label="Example range" />
      <FormsRating v-model="rating" />
      <FormsCurrency v-model="controls.currency!" />
      <FormsDateRange v-model="dates" />
      <FormsAddress v-model="address" />
      <FormsFileUpload v-model="files" multiple />
      <FormsSignature v-model="signature" />
      <FormsField label="Invalid example" error="This field is required." v-slot="field">
        <FormsInput :id="field.id" invalid :aria-describedby="field.describedBy" />
      </FormsField>
    </div>
  </div>
</template>
