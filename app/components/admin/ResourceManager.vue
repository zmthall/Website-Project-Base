<script setup lang="ts">
// TODO [ADMIN-01]: Add durable audit events and least-privilege roles for content edits/deletes, applicant/message access and auth policy changes; add retention/export actions where appropriate. See docs/integration-audit.md.

import { resources } from '#shared/data/management';
import type {
  ManagedPage,
  ManagedRecord,
  ManagedValue,
  ResourceKind,
} from '#shared/types/management';
const props = defineProps<{ kind: ResourceKind }>();
const definition = computed(() => resources[props.kind]);
const api = useAdminManagement();
const result = ref<ManagedPage>({ items: [], total: 0, page: 1, pageSize: 20 });
const search = ref('');
const status = ref('');
const busy = ref(false);
const error = ref('');
const message = ref('');
const modal = ref(false);
const editing = ref<ManagedRecord>();
const fields = ref<Record<string, ManagedValue>>({});
const deleting = ref<ManagedRecord>();
const statusOptions = computed(
  () => definition.value.fields.find((field) => field.key === 'status')?.options ?? [],
);
function disclose(errorValue: unknown) {
  const data = errorValue as { data?: { statusMessage?: string }; message?: string };
  error.value =
    data.data?.statusMessage ||
    'The operation could not be completed. Check your connection and try again.';
}
async function load(page = 1) {
  busy.value = true;
  error.value = '';
  try {
    result.value = await api.list(props.kind, page, search.value, status.value);
  } catch (e) {
    disclose(e);
  } finally {
    busy.value = false;
  }
}
onMounted(() => load());
function openEditor(record?: ManagedRecord) {
  editing.value = record;
  error.value = '';
  message.value = '';
  fields.value = Object.fromEntries(
    definition.value.fields.map((field) => [
      field.key,
      record?.fields[field.key] ??
        (field.type === 'checkbox'
          ? false
          : field.type === 'number'
            ? 5
            : field.key === 'timeZone'
              ? 'America/Denver'
              : (field.options?.[0] ?? '')),
    ]),
  );
  for (const field of definition.value.fields)
    if (field.type === 'datetime-local' && fields.value[field.key]) {
      const date = new Date(String(fields.value[field.key]));
      fields.value[field.key] = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
  modal.value = true;
}
function immutable(key: string) {
  return Boolean(
    editing.value &&
    ((['messages', 'applications'].includes(props.kind) && !['notes', 'status'].includes(key)) ||
      (props.kind === 'subscribers' && key !== 'status') ||
      (props.kind === 'blog' && key === 'slug')),
  );
}
async function save() {
  busy.value = true;
  error.value = '';
  try {
    const payload = { ...fields.value };
    for (const field of definition.value.fields)
      if (field.type === 'datetime-local' && payload[field.key])
        payload[field.key] = new Date(String(payload[field.key])).toISOString();
    await api.save(props.kind, payload, editing.value);
    modal.value = false;
    message.value = 'Saved.';
    await load(result.value.page);
  } catch (e) {
    disclose(e);
  } finally {
    busy.value = false;
  }
}
async function remove() {
  if (!deleting.value) return;
  busy.value = true;
  error.value = '';
  try {
    await api.remove(props.kind, deleting.value);
    deleting.value = undefined;
    message.value = 'Deleted.';
    await load(
      result.value.items.length === 1 ? Math.max(1, result.value.page - 1) : result.value.page,
    );
  } catch (e) {
    disclose(e);
  } finally {
    busy.value = false;
  }
}
function label(record: ManagedRecord) {
  return String(record.fields.title || record.fields.name || record.fields.email || record.id);
}
function state(record: ManagedRecord) {
  return record.fields.status === 'published' &&
    Date.parse(String(record.fields.publishedAt)) > Date.now()
    ? 'scheduled'
    : record.fields.status;
}
function date(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
</script>
<template>
  <section class="stack admin-manager">
    <header class="stack">
      <h1>{{ definition.title }}</h1>
      <p class="muted">{{ definition.description }}</p>
    </header>
    <p v-if="error && !modal && !deleting" role="alert" class="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <form class="admin-toolbar" @submit.prevent="load()">
      <FormsField v-slot="{ id, describedBy }" label="Search">
        <FormsSearch :id="id" v-model="search" :aria-describedby="describedBy" maxlength="200" />
      </FormsField>
      <FormsField v-slot="{ id }" label="Status">
        <FormsSelect
          :id="id"
          v-model="status"
          :options="[
            { label: 'All statuses', value: '' },
            ...statusOptions.map((value) => ({ label: value, value })),
          ]"
        />
      </FormsField>
      <BaseButton type="submit" variant="outline" :loading="busy">Apply filters</BaseButton>
      <BaseButton v-if="definition.canCreate" :disabled="busy" @click="openEditor()">
        Create {{ definition.singular }}
      </BaseButton>
    </form>
    <div class="admin-table-wrap">
      <table>
        <caption class="sr-only">{{ definition.title }}</caption>
        <thead>
          <tr>
            <th scope="col">
              {{
                kind === 'messages' || kind === 'reviews' || kind === 'applications'
                  ? 'Name'
                  : kind === 'subscribers'
                    ? 'Email'
                    : 'Title'
              }}
            </th>
            <th scope="col">Details</th>
            <th scope="col">Status</th>
            <th scope="col">Updated</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in result.items" :key="record.id">
            <th scope="row">{{ label(record) }}</th>
            <td>
              {{
                record.fields.email ||
                record.fields.date ||
                record.fields.issue ||
                record.fields.summary ||
                (record.fields.rating ? `${record.fields.rating} / 5` : '')
              }}
            </td>
            <td>{{ state(record) }}</td>
            <td>{{ date(record.updatedAt) }}</td>
            <td>
              <div class="admin-actions">
                <BaseButton
                  variant="outline"
                  size="sm"
                  :aria-label="`Edit ${label(record)}`"
                  @click="openEditor(record)"
                >
                  {{ ['messages', 'applications'].includes(kind) ? 'Read / manage' : 'Edit' }}
                </BaseButton>
                <NuxtLink
                  v-if="kind === 'blog' && state(record) === 'published'"
                  :to="`/blog/${record.id}`"
                >
                  View post
                </NuxtLink>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :aria-label="`Delete ${label(record)}`"
                  @click="deleting = record"
                >
                  Delete
                </BaseButton>
              </div>
            </td>
          </tr>
          <tr v-if="!result.items.length">
            <td colspan="5">{{ busy ? 'Loading…' : 'No records found.' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="admin-toolbar">
      <p role="status">{{ result.total }} records · Page {{ result.page }}</p>
      <BaseButton
        variant="outline"
        :disabled="busy || result.page === 1"
        @click="load(result.page - 1)"
      >
        Previous
      </BaseButton>
      <BaseButton
        variant="outline"
        :disabled="busy || result.page * result.pageSize >= result.total"
        @click="load(result.page + 1)"
      >
        Next
      </BaseButton>
    </div>
    <BaseModal
      v-model:open="modal"
      :wide="definition.fields.some((field) => field.key === 'content')"
      :title="`${editing ? 'Edit' : 'Create'} ${definition.singular}`"
      description="Review the fields before saving."
    >
      <form class="stack" @submit.prevent="save">
        <p v-if="error" role="alert" class="alert">{{ error }}</p>
        <fieldset :disabled="busy" class="stack admin-editor">
          <legend class="sr-only">{{ definition.title }}</legend>
          <BlogAdminLiveEditor
            v-if="definition.fields.some((field) => field.key === 'content')"
            v-model="fields.content as string"
            :disabled="busy"
          />
          <template
            v-for="field in definition.fields.filter((field) => field.key !== 'content')"
            :key="field.key"
          >
            <div v-if="field.type === 'checkbox'" class="field">
              <FormsCheckbox
                v-model="fields[field.key] as boolean"
                :label="field.label"
                :required="field.required"
                :disabled="busy || immutable(field.key)"
              />
              <FormsHelp v-if="field.help">{{ field.help }}</FormsHelp>
            </div>
            <FormsField
              v-else
              v-slot="{ id, describedBy, invalid }"
              :label="field.label"
              :help="field.help"
              :required="field.required"
            >
              <FormsTextarea
                v-if="field.type === 'textarea'"
                :id="id"
                v-model="fields[field.key] as string"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
                :required="field.required"
                :readonly="immutable(field.key)"
                :disabled="busy"
                :rows="4"
                maxlength="10000"
              />
              <FormsSelect
                v-else-if="field.type === 'select'"
                :id="id"
                v-model="fields[field.key] as string"
                :aria-describedby="describedBy"
                :required="field.required"
                :disabled="busy || immutable(field.key)"
                :options="(field.options ?? []).map((value) => ({ label: value, value }))"
              />
              <FormsNumber
                v-else-if="field.type === 'number'"
                :id="id"
                v-model="fields[field.key] as number"
                :aria-describedby="describedBy"
                :invalid="invalid"
                min="1"
                max="5"
                :required="field.required"
                :readonly="immutable(field.key)"
                :disabled="busy"
              />
              <FormsInput
                v-else
                :id="id"
                v-model="fields[field.key] as string"
                :aria-describedby="describedBy"
                :invalid="invalid"
                :type="field.type || 'text'"
                :required="field.required"
                :readonly="immutable(field.key)"
                :disabled="busy"
                maxlength="1000"
              />
            </FormsField>
          </template>
          <div class="admin-actions">
            <BaseButton type="submit" :loading="busy">Save {{ definition.singular }}</BaseButton>
            <BaseButton variant="outline" @click="modal = false">Cancel</BaseButton>
          </div>
        </fieldset>
      </form>
    </BaseModal>
    <BaseModal
      :open="!!deleting"
      title="Delete this record?"
      description="This permanently deletes the selected record."
      @update:open="
        (value) => {
          if (!value) deleting = undefined;
        }
      "
    >
      <div class="stack">
        <p v-if="error" role="alert" class="alert">{{ error }}</p>
        <p>{{ deleting && label(deleting) }}</p>
        <div class="admin-actions">
          <BaseButton variant="danger" :loading="busy" @click="remove">Confirm delete</BaseButton>
          <BaseButton variant="outline" @click="deleting = undefined">Cancel</BaseButton>
        </div>
      </div>
    </BaseModal>
  </section>
</template>
