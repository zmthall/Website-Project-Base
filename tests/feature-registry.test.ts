import test from 'node:test';
import assert from 'node:assert/strict';
import * as registry from '../feature-layers/registry';
import * as appointmentsLayer from '../feature-layers/appointments';
import * as contactLayer from '../feature-layers/contact';
import * as contactTheme from '../feature-layers/contact/theme';
import * as customerLayer from '../feature-layers/customer';

test('feature metadata is available from one typed registry', () => {
  const { getFeatureDefinition } = registry;
  assert.equal(getFeatureDefinition('contact')?.key, 'contact');
  assert.deepEqual(getFeatureDefinition('appointments')?.dependencies, ['customer']);
  assert.equal(getFeatureDefinition('administrator')?.key, 'administrator');
  assert.equal(getFeatureDefinition('auth'), undefined);
  assert.equal(getFeatureDefinition('unknown'), undefined);
});

test('administrator owns its complete authentication implementation in one layer', () => {
  const administrator = registry.getFeatureDefinition('administrator');
  assert.ok(administrator);
  assert.ok(
    [
      ...(administrator.implementation.app ?? []),
      ...(administrator.implementation.server ?? []),
    ].every((path) => path.startsWith('feature-layers/administrator/')),
  );
  assert.deepEqual(administrator.routes, ['/admin']);
});

test('contact owns its implementation inside the contact layer', () => {
  const contact = registry.getFeatureDefinition('contact');

  assert.ok(contact);
  assert.ok(
    [...(contact.implementation.app ?? []), ...(contact.implementation.server ?? [])].every(
      (path) => path.startsWith('feature-layers/contact/'),
    ),
  );
  assert.deepEqual(contact.implementation.shared, [
    'app/api/types.ts',
    'feature-layers/_shared',
    'app/types/forms.ts',
    'shared/types/management.ts',
    'server/utils/bounded-body.ts',
    'server/utils/public-submissions.ts',
    'server/utils/management-validation.ts',
    'server/utils/management-store.ts',
  ]);
});

test('contact publishes its form, inbox metadata and discovery route from the layer', () => {
  const contactPackage = contactLayer as unknown as {
    contactForm?: { fields: { name: string }[] };
  };
  const theme = contactTheme as unknown as { contactSectionRegistry?: Record<string, unknown> };
  const contact = registry.getFeatureDefinition('contact') as unknown as {
    management?: Record<string, { feature: string; editableFields?: string[] }>;
    sitemapRoutes?: string[];
  };

  assert.deepEqual(
    contactPackage.contactForm?.fields.map(({ name }) => name),
    ['name', 'email', 'topic', 'message', 'consent'],
  );
  assert.equal(contact.management?.messages.feature, 'contact');
  assert.deepEqual(contact.management?.messages.editableFields, ['notes', 'status']);
  assert.deepEqual(contact.sitemapRoutes, ['/contact']);
  assert.deepEqual(Object.keys(theme.contactSectionRegistry ?? {}), [
    'contact-split',
    'contact-simple',
    'contact-withmap',
    'contact-locations',
  ]);
});

test('appointments owns and publishes its complete feature contract from the layer', () => {
  const appointmentPackage = appointmentsLayer as unknown as {
    appointments?: { services: { value: string }[] };
    appointmentWorkflow?: { timeZone: string };
    createAppointmentsApi?: unknown;
  };
  const appointments = registry.getFeatureDefinition('appointments') as unknown as {
    implementation: { app?: string[]; server?: string[] };
    sitemapRoutes?: string[];
  };

  assert.ok(
    [
      ...(appointments.implementation.app ?? []),
      ...(appointments.implementation.server ?? []),
    ].every((path) => path.startsWith('feature-layers/appointments/')),
  );
  assert.deepEqual(
    appointmentPackage.appointments?.services.map(({ value }) => value),
    ['introduction', 'consultation', 'follow-up'],
  );
  assert.equal(appointmentPackage.appointmentWorkflow?.timeZone, 'America/Denver');
  assert.equal(typeof appointmentPackage.createAppointmentsApi, 'function');
  assert.deepEqual(appointments.sitemapRoutes, ['/appointments']);
});

test('customer owns and publishes its complete account contract from the layer', () => {
  const customerPackage = customerLayer as unknown as {
    createCustomerAuthAdapter?: unknown;
    createCustomerAuthStore?: unknown;
    sessionIsCustomer?: unknown;
  };
  const customer = registry.getFeatureDefinition('customer');

  assert.ok(customer);
  assert.ok(
    [...(customer.implementation.app ?? []), ...(customer.implementation.server ?? [])].every(
      (path) => path.startsWith('feature-layers/customer/'),
    ),
  );
  assert.equal(typeof customerPackage.createCustomerAuthAdapter, 'function');
  assert.equal(typeof customerPackage.createCustomerAuthStore, 'function');
  assert.equal(typeof customerPackage.sessionIsCustomer, 'function');
  assert.deepEqual(customer.routes, ['/customer']);
});

test('every implemented feature owns its app and server implementation inside its layer', () => {
  const plannedFeatures = new Set(['products']);

  for (const definition of registry.featureDefinitions) {
    if (plannedFeatures.has(definition.key)) continue;
    const ownedPaths = [
      ...(definition.implementation.app ?? []),
      ...(definition.implementation.server ?? []),
    ];
    assert.ok(ownedPaths.length > 0, `${definition.key} must declare owned implementation`);
    assert.ok(
      ownedPaths.every((path) => path.startsWith(`feature-layers/${definition.key}/`)),
      `${definition.key} has implementation outside its layer`,
    );
  }
});

test('feature layers publish every feature-specific management resource', () => {
  const managedKinds = registry.featureDefinitions.flatMap((definition) =>
    Object.keys(definition.management ?? {}),
  );
  assert.deepEqual(managedKinds.sort(), [
    'applications',
    'blog',
    'events',
    'jobs',
    'messages',
    'newsletters',
    'reviews',
    'subscribers',
  ]);
});

test('shared site content publishes database management resources without artificial layers', async () => {
  const { resourceKinds } = await import('../shared/data/management');
  for (const kind of ['business', 'faqs', 'media', 'ratings'])
    assert.ok(resourceKinds.includes(kind as never), `Missing shared content resource: ${kind}`);
});

test('database-backed editorial features own repositories in their layers', () => {
  for (const key of ['blog', 'events', 'reviews'] as const) {
    const definition = registry.getFeatureDefinition(key);
    assert.ok(
      definition?.implementation.server?.some((path) => path.includes('/server/repositories/')),
      `${key} must own its PostgreSQL repository adapter`,
    );
  }
});

test('feature registry rejects duplicate keys, routes and missing dependencies', () => {
  const validate = registry.validateFeatureDefinitions as unknown as (
    definitions: readonly unknown[],
  ) => void;
  const base = {
    name: 'Example',
    description: 'Example feature',
    configuration: 'boolean',
    maturity: 'planned',
    dependencies: [],
    routes: ['/example'],
    implementation: {},
  };
  assert.throws(
    () =>
      validate([
        { ...base, key: 'contact' },
        { ...base, key: 'contact', routes: ['/other'] },
      ]),
    /Duplicate feature key/,
  );
  assert.throws(
    () =>
      validate([
        { ...base, key: 'contact' },
        { ...base, key: 'reviews' },
      ]),
    /Duplicate feature route/,
  );
  assert.throws(
    () => validate([{ ...base, key: 'contact', dependencies: ['auth'] }]),
    /Unknown feature dependency/,
  );
});
