import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createApiClient } from '../app/api/client';
import { ApiError, normalizeApiError } from '../app/api/errors';

for (const [status, kind] of Object.entries({
  400: 'validation',
  401: 'authentication',
  403: 'authorization',
  404: 'not-found',
  409: 'conflict',
  422: 'validation',
  429: 'rate-limit',
  500: 'server',
  503: 'server',
  418: 'http',
})) {
  test(`normalizes HTTP ${status} without leaking diagnostics`, () => {
    const error = normalizeApiError({
      response: { status: Number(status) },
      data: { message: 'SECRET', stack: 'SECRET', code: 'INVALID', errors: { email: ['SECRET'] } },
    });
    assert.equal(error.kind, kind);
    assert.equal(error.status, Number(status));
    assert.equal(error.code, 'INVALID');
    assert.ok(!JSON.stringify(error).includes('SECRET'));
    assert.ok(!error.message.includes('SECRET'));
    if (kind === 'validation')
      assert.deepEqual(error.fieldErrors?.email, ['Please check this field.']);
    assert.equal(normalizeApiError(error), error);
  });
}

test('normalizes malformed, network, timeout and cancellation failures', () => {
  assert.equal(normalizeApiError(null).kind, 'unknown');
  assert.equal(normalizeApiError({ name: 'FetchError' }).kind, 'network');
  assert.equal(normalizeApiError({ cause: { name: 'TimeoutError' } }).kind, 'timeout');
  assert.equal(normalizeApiError(new DOMException('', 'AbortError')).kind, 'cancelled');
});

test('HTTP transport preserves bodies, isolates auth, encodes queries and handles failures', async (t) => {
  let calls = 0;
  const server = createServer(async (req, res) => {
    calls++;
    if (req.url === '/api/unauthorized') res.statusCode = 401;
    if (req.url === '/api/fail') res.statusCode = 503;
    if (req.url === '/api/redirect') {
      res.statusCode = 302;
      res.setHeader('Location', '/api/target');
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    if (req.url === '/api/slow') await new Promise((resolve) => setTimeout(resolve, 100));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ url: req.url, headers: req.headers, body }));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const baseURL = `http://127.0.0.1:${address.port}/api`;
  let token = 'first';
  let unauthorized = 0;
  const api = createApiClient({
    baseURL,
    getToken: () => token,
    onUnauthorized: () => {
      unauthorized++;
      throw new Error('adapter failed');
    },
  });
  type Echo = { url: string; headers: Record<string, string>; body: string };
  const response = await api<Echo>('/echo', {
    method: 'POST',
    body: { ok: true },
    query: { search: 'a&b', tag: ['one', 'two'] },
    auth: true,
  });
  assert.equal(response.headers.authorization, 'Bearer first');
  assert.equal(response.headers.accept, 'application/json');
  assert.match(response.headers['content-type']!, /application\/json/);
  assert.equal(response.body, '{"ok":true}');
  assert.equal(new URL(response.url, baseURL).searchParams.get('search'), 'a&b');
  assert.deepEqual(new URL(response.url, baseURL).searchParams.getAll('tag'), ['one', 'two']);
  token = 'second';
  const [authenticated, anonymous, isolated] = await Promise.all([
    api<Echo>('/echo', { auth: true }),
    api<Echo>('/echo'),
    createApiClient({ baseURL, getToken: () => 'other' })<Echo>('/echo', { auth: true }),
  ]);
  assert.equal(authenticated.headers.authorization, 'Bearer second');
  assert.equal(anonymous.headers.authorization, undefined);
  assert.equal(anonymous.headers.cookie, undefined);
  assert.equal(isolated.headers.authorization, 'Bearer other');
  const multipart = new FormData();
  multipart.set('name', 'value');
  assert.match(
    (await api<Echo>('/echo', { method: 'POST', body: multipart })).headers['content-type']!,
    /multipart\/form-data; boundary=/,
  );
  await assert.rejects(api('/unauthorized', { auth: true }), { kind: 'authentication' });
  assert.equal(unauthorized, 1);
  const before = calls;
  await assert.rejects(api('/fail', { method: 'POST', body: {} }), { kind: 'server' });
  assert.equal(calls, before + 1);
  await assert.rejects(api('/slow', { timeout: 5 }), { kind: 'timeout' });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api('/echo', { signal: controller.signal }), { kind: 'cancelled' });
  await assert.rejects(api('/redirect'), ApiError);
  const beforeInvalid = calls;
  for (const path of [
    'https://other.test',
    '//other.test',
    '/../secret',
    '/%2e%2e/secret',
    '/\\other.test',
    '/echo?x=1',
  ]) {
    await assert.rejects(api(path), ApiError);
  }
  assert.equal(calls, beforeInvalid);
});
