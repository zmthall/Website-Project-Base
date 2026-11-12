import { ofetch } from 'ofetch';
import type {
  ManagedPage,
  ManagedRecord,
  ManagedValue,
  ResourceKind,
  RenderedMarkdown,
} from '#shared/types/management';
export function useAdminManagement() {
  const auth = useAdminAuth();
  const request = ofetch.create({
    baseURL: '/api/admin',
    credentials: 'same-origin',
    retry: 0,
    timeout: 15000,
  });
  const write = <T>(
    path: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body: Record<string, unknown>,
  ) =>
    auth.authorized((csrf) =>
      request<T>(path, { method, body, headers: { 'X-CSRF-Token': csrf } }),
    );
  return {
    list: (kind: ResourceKind, page = 1, search = '', status = '') =>
      request<ManagedPage>(`/manage/${kind}`, { query: { page, search, status } }),
    save: (kind: ResourceKind, fields: Record<string, ManagedValue>, record?: ManagedRecord) =>
      write<ManagedRecord>(
        `/manage/${kind}${record ? '/' + encodeURIComponent(record.id) : ''}`,
        record ? 'PUT' : 'POST',
        { fields, version: record?.version },
      ),
    remove: (kind: ResourceKind, record: ManagedRecord) =>
      write<undefined>(`/manage/${kind}/${encodeURIComponent(record.id)}`, 'DELETE', {
        version: record.version,
      }),
    preview: (content: string) => write<RenderedMarkdown>('/blog/preview', 'POST', { content }),
    settings: <T>() => request<T>('/settings/auth'),
    saveSettings: (body: Record<string, unknown>) =>
      write<undefined>('/settings/auth', 'PUT', body),
  };
}
