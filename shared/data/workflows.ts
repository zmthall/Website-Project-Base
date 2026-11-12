// TODO [PAY-03]: Before real checkout ships, disable simulation routes and demo catalog in production and require a registered real provider; setting an env provider name is not sufficient. See docs/integration-audit.md.
// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
/** Explicit process-local simulation. No real booking, quotes, emails or charges. */
export const workflows = {
  mode: 'demo' as const,
  appointments: {
    timeZone: 'America/Denver',
    leadMinutes: 60,
    horizonDays: 90,
    weekdays: [1, 2, 3, 4, 5],
    closedDates: [] as string[],
    serviceMinutes: { introduction: 30, consultation: 60, 'follow-up': 30 } as Record<
      string,
      number
    >,
    locations: [
      { value: 'office', label: 'Main office' },
      { value: 'remote', label: 'Remote meeting' },
    ],
    providers: [{ value: 'team', label: 'Consultation team', locations: ['office', 'remote'] }],
    opens: '09:00',
    closes: '17:00',
    intervalMinutes: 30,
  },
  estimates: { acceptanceEnabled: true, depositsEnabled: true, maxAttachments: 5 },
  payments: {
    provider: 'demo' as const,
    expiresMinutes: 30,
    products: [
      {
        id: 'consultation',
        label: 'Example consultation payment',
        amount: 5000,
        currency: 'USD' as const,
      },
    ],
  },
};
