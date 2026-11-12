import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { integrationDefaults } from '../server/config/integrations';
function flatten(
  value: Record<string, unknown>,
  prefix = 'NUXT_INTEGRATIONS',
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      const name = prefix + '_' + key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
      return item && typeof item === 'object'
        ? Object.entries(flatten(item as Record<string, unknown>, name))
        : [[name, item]];
    }),
  );
}
test('all integration env placeholders match declared private defaults and secret placeholders are blank', () => {
  const defaults = flatten(integrationDefaults);
  const example = readFileSync('.env.example', 'utf8');
  const entries = Object.fromEntries(
    example
      .split('\n')
      .filter((line) => /^NUXT_INTEGRATIONS_[A-Z_]+=/.test(line))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
  assert.deepEqual(Object.keys(entries).sort(), Object.keys(defaults).sort());
  for (const [name, value] of Object.entries(defaults))
    assert.equal(entries[name], String(value), `Example/default mismatch for ${name}`);
  for (const [name, value] of Object.entries(entries))
    if (
      /_(TOKEN|SECRET|PASSWORD|API_KEY|ACCESS_KEY_ID|SECRET_ACCESS_KEY|SERVICE_KEY|ENCRYPTION_KEY|WEBHOOK_SIGNATURE_KEY)$/.test(
        name,
      )
    )
      assert.equal(value, '', `Secret placeholder must be blank: ${name}`);
  const nuxt = readFileSync('nuxt.config.ts', 'utf8');
  assert.match(nuxt, /integrations: integrationDefaults/);
  assert.doesNotMatch(nuxt, /public:\s*\{[^}]*integrations/s);
});
test('audit TODO IDs have real source anchors and no dangling linked files', () => {
  const audit = readFileSync('docs/integration-audit.md', 'utf8');
  const rows = [...audit.matchAll(/^\|\s*([A-Z]+-\d+)\s*\|.*$/gm)];
  assert.ok(rows.length >= 30);
  for (const row of rows) {
    const id = row[1]!;
    const paths = [...row[0].matchAll(/\]\(\.\.\/([^)]*)\)/g)].map((match) => match[1]!);
    assert.ok(paths.length, `Missing anchors for ${id}`);
    for (const path of paths) {
      assert.ok(existsSync(path), `Missing anchor path for ${id}`);
      assert.ok(
        readFileSync(path, 'utf8').includes(`TODO [${id}]`),
        `Missing TODO anchor for ${id} in ${path}`,
      );
    }
  }
});
