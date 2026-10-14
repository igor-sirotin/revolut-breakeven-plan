/**
 * Revolut UK plan data — the only file you need to edit when things change.
 *
 * aer      annual equivalent rate paid on instant-access Savings, as a fraction
 * monthly  subscription price per month when billed monthly, in £
 * annual   subscription price per year when billed annually, in £
 *
 * Prices and rates are the published UK figures; see `checked` for when they
 * were last verified. Rates are the base (non-boosted) instant-access rates.
 */
window.REVOLUT_DATA = {
  checked: 'October 2026',
  currency: 'GBP',

  plans: [
    { name: 'Standard', aer: 0.0290, monthly: 0,     annual: 0   },
    { name: 'Plus',     aer: 0.0290, monthly: 3.99,  annual: 40  },
    { name: 'Premium',  aer: 0.0325, monthly: 8.99,  annual: 90  },
    { name: 'Metal',    aer: 0.0340, monthly: 16.99, annual: 165 },
    { name: 'Ultra',    aer: 0.0400, monthly: 60,    annual: 595 }
  ],

  // Balance above which the top rate no longer applies, used only in the
  // assumptions line. Set to null to drop the mention.
  topRateCap: 200000
};
