import { expect, request as requests, test } from '@playwright/test';

test('private uploads enforce CSRF, ownership, inspection, download and estimate attachment', async () => {
  const contexts = await Promise.all(
    [0, 1].map(() => requests.newContext({ baseURL: 'http://127.0.0.1:43188' })),
  );
  const [owner, stranger] = contexts;
  try {
    async function register(client: NonNullable<typeof owner>) {
      const session = await (await client.get('/api/customer/auth/session')).json();
      const response = await client.post('/api/customer/auth/register', {
        headers: { 'X-CSRF-Token': session.csrfToken },
        data: {
          email: `upload-${crypto.randomUUID()}@example.com`,
          password: 'local-test-password-123',
        },
      });
      expect(response.ok()).toBe(true);
      return (await response.json()).csrfToken as string;
    }
    const csrf = await register(owner!);
    await register(stranger!);
    const bytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    ]);
    const request = {
      name: 'project.png',
      size: bytes.length,
      mimeType: 'image/png',
      temporary: true,
    };

    expect((await owner!.post('/api/uploads', { data: request })).status()).toBe(403);
    const initialized = await owner!.post('/api/uploads', {
      headers: { 'X-CSRF-Token': csrf, 'Idempotency-Key': crypto.randomUUID() },
      data: request,
    });
    expect(initialized.ok()).toBe(true);
    const session = await initialized.json();
    expect((await stranger!.get(`/api/uploads/${session.id}`)).status()).toBe(404);
    expect(
      (
        await owner!.put(session.contentPath, {
          headers: { 'X-CSRF-Token': csrf, 'Content-Type': request.mimeType },
          data: bytes,
        })
      ).ok(),
    ).toBe(true);
    const completed = await owner!.post(`/api/uploads/${session.id}/complete`, {
      headers: { 'X-CSRF-Token': csrf, 'Idempotency-Key': crypto.randomUUID() },
    });
    expect(completed.ok()).toBe(true);
    expect((await completed.json()).status).toBe('ready');
    const download = await owner!.get(`/api/uploads/${session.id}/content`);
    expect(download.ok()).toBe(true);
    expect(await download.body()).toEqual(bytes);
    expect((await stranger!.get(`/api/uploads/${session.id}/content`)).status()).toBe(404);

    const estimate = await owner!.post('/api/workflows/estimates', {
      headers: { 'X-CSRF-Token': csrf, 'Idempotency-Key': crypto.randomUUID() },
      data: {
        service: 'new-project',
        description: 'A project request with a privately owned attachment.',
        budget: 'exploring',
        timeline: 'flexible',
        contact: { name: 'Example', email: 'example@example.com' },
        uploadIds: [session.id],
        consent: true,
      },
    });
    expect(estimate.ok()).toBe(true);
    expect((await estimate.json()).attachments).toEqual([
      {
        id: session.id,
        name: request.name,
        size: bytes.length,
        mimeType: request.mimeType,
      },
    ]);
    expect(
      (
        await owner!.delete(`/api/uploads/${session.id}`, {
          headers: { 'X-CSRF-Token': csrf, 'Idempotency-Key': crypto.randomUUID() },
        })
      ).status(),
    ).toBe(409);
  } finally {
    await Promise.all(contexts.map((context) => context.dispose()));
  }
});
