/**
 * Revolut UK plan data — the only file you need to edit when things change.
 *
 * aer      annual equivalent rate paid on instant-access Savings, as a fraction
 * monthly  subscription price per month when billed monthly, in £
 * annual   subscription price per year when billed annually, in £
 * cap      optional balance above which `aer` no longer applies, in £
 * capAer   rate paid on the part of the balance above `cap`, as a fraction
 *
 * Prices and rates are the published UK figures; see `checked` for when they
 * were last verified. Rates are the base (non-boosted) instant-access rates.
 */
window.REVOLUT_DATA = {
  checked: 'November 2026',
  currency: 'GBP',

  plans: [
    { name: 'Standard', aer: 0.0315, monthly: 0,     annual: 0   },
    { name: 'Plus',     aer: 0.0315, monthly: 3.99,  annual: 40  },
    { name: 'Premium',  aer: 0.0351, monthly: 8.99,  annual: 90  },
    { name: 'Metal',    aer: 0.0375, monthly: 16.99, annual: 165 },
    { name: 'Ultra',    aer: 0.0400, monthly: 60,    annual: 595, cap: 200000, capAer: 0.0375 }
  ]
};
