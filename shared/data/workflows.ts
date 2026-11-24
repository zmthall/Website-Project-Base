// TODO [PAY-03]: Before real checkout ships, disable simulation routes and demo catalog in production and require a registered real provider; setting an env provider name is not sufficient. See docs/integration-audit.md.
/** Explicit process-local simulation. No real booking, quotes, emails or charges. */
export const workflows = {
  mode: 'demo' as const,
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
