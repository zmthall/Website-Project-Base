import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applicationFields } from '../server/utils/career-applications';
import { ManagementStore } from '../../../server/utils/management-store';
import { validateManagedFields } from '../../../server/utils/management-validation';
const application = {
  positionId: 'general',
  name: 'Example Applicant',
  email: 'applicant@example.com',
  phone: '555-123-4567',
  location: 'Denver, CO',
  employmentType: 'Either',
  availability: 'Weekdays',
  experience: 'Customer support',
  consent: { granted: true },
  accuracy: true,
};
test('career submissions bind openings on the server and persist private records', () => {
  const directory = mkdtempSync(join(tmpdir(), 'career-test-'));
  const path = join(directory, 'cms.sqlite');
  let store = new ManagementStore(path);
  try {
    const job = store.save(
      'jobs',
      validateManagedFields('jobs', {
        title: 'Support specialist',
        department: 'Operations',
        location: 'Denver',
        employmentType: 'Full-time',
        description: 'Help our customers.',
        status: 'open',
      }),
    );
    const fields = applicationFields(
      {
        ...application,
        positionId: job.id,
        position: 'Forged title',
        status: 'hired',
        notes: 'Forged notes',
        consentAt: 'forged',
      },
      store.list('jobs'),
    );
    assert.equal(fields.position, job.fields.title);
    assert.equal(fields.status, 'new');
    assert.equal(fields.notes, '');
    assert.ok(Number.isFinite(Date.parse(String(fields.consentAt))));
    const saved = store.save('applications', fields);
    store.close();
    store = new ManagementStore(path);
    assert.equal(store.get('applications', saved.id)?.fields.email, application.email);
    const closed = { ...job, fields: { ...job.fields, status: 'closed' } };
    assert.throws(
      () => applicationFields({ ...application, positionId: job.id }, [closed]),
      /no longer available/,
    );
    assert.throws(
      () => applicationFields({ ...application, positionId: 'missing' }, []),
      /no longer available/,
    );
    assert.equal(applicationFields(application, []).position, 'General application');
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test('career validation rejects missing consent, invalid input, unsafe links and oversized answers', () => {
  for (const input of [
    { consent: { granted: false } },
    { accuracy: false },
    { name: '' },
    { email: 'invalid' },
    { phone: '12' },
    { employmentType: 'invalid' },
    { website: 'spam' },
    { availability: 'x'.repeat(10001) },
    { portfolioUrl: 'javascript:alert(1)' },
    { portfolioUrl: 'https://user:pass@example.com' },
    { startDate: '2026-02-30' },
  ])
    assert.throws(() => applicationFields({ ...application, ...input }, []));
});
