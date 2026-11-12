import { test } from 'node:test';
import assert from 'node:assert/strict';
import { websiteUI } from '../app/theme/config';
import { themeTokens, contrastRatio, onColor } from '../app/theme/tokens';
import { validateFields, visibleFields } from '../app/utils/forms';
import { businessHoursStatus } from '../app/utils/hours';
import { issueForm, surveyForm } from '../app/data/demo';
import type { BusinessHours } from '../shared/types/business';

test('palette foregrounds preserve readable contrast for dark and light brand colors', () => {
  for (const color of [
    '#000000',
    '#ffffff',
    '#284F46',
    '#DDE5DD',
    '#D9C8AC',
    '#888888',
    '#ff0000',
    '#0000ff',
  ])
    assert.ok(contrastRatio(color, onColor(color)) >= 4.5, color);
  assert.equal(themeTokens(websiteUI)['--button-radius'], '.45rem');
  const config = structuredClone(websiteUI);
  config.packs.buttons.shape = 'square';
  assert.equal(themeTokens(config)['--button-radius'], '0');
  config.palette.primary = 'red; }';
  assert.throws(() => themeTokens(config));
});
test('form validation covers hidden required fields, select options, and untrusted URLs', () => {
  assert.ok(
    !visibleFields(surveyForm.fields, { experience: 'excellent' }).some(
      (f) => f.name === 'improvement',
    ),
  );
  assert.equal(
    validateFields(surveyForm.fields, { experience: 'improve' }).improvement,
    'This field is required.',
  );
  const valid = {
    email: 'person@example.com',
    category: 'bug',
    details: 'The example does not load.',
  };
  assert.deepEqual(validateFields(issueForm.fields, valid), {});
  assert.ok(validateFields(issueForm.fields, { ...valid, page: 'javascript:alert(1)' }).page);
  assert.ok(validateFields(issueForm.fields, { ...valid, category: 'unknown' }).category);
});
test('opening hours handle overnight periods and explicit holiday closures', () => {
  const hours: BusinessHours = {
    regular: [{ day: 'monday', periods: [{ opens: '22:00', closes: '02:00' }] }],
  };
  assert.equal(businessHoursStatus(hours, 'UTC', new Date('2026-10-13T01:00:00Z')).open, true);
  assert.equal(businessHoursStatus(hours, 'UTC', new Date('2026-10-13T03:00:00Z')).open, false);
  hours.special = [{ date: '2026-10-13', periods: [] }];
  assert.equal(businessHoursStatus(hours, 'UTC', new Date('2026-10-13T01:00:00Z')).open, false);
  assert.ok(
    businessHoursStatus(hours, 'UTC', new Date('2026-10-12T20:00:00Z')).nextChange?.includes(
      '22:00',
    ),
  );
});
