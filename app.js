/**
 * Works out, for every balance, which Revolut plan leaves you with the most
 * money after a year — interest earned minus subscription paid — and renders
 * the resulting ladder of crossover points.
 *
 * Net return for a plan at balance b, over one year:  b * aer - fee
 * Two plans break even where  b * aerA - feeA = b * aerB - feeB, i.e.
 *   b = (feeB - feeA) / (aerB - aerA)
 * A plan only ever becomes worth buying if it pays a strictly higher rate, so
 * we walk upward: from the current best plan, the next rung is whichever
 * higher-rate plan crosses over first.
 */
(function () {
  'use strict';

  var data = window.REVOLUT_DATA;
  var MAX_RUNGS = 10; // guards against a bad data edit looping forever

  var state = { billing: 'monthly' };

  /** Yearly cost of each plan under the selected billing period. */
  function plansWithFees(billing) {
    return data.plans.map(function (plan) {
      return {
        name: plan.name,
        aer: plan.aer,
        monthly: plan.monthly,
        annual: plan.annual,
        fee: billing === 'annual' ? plan.annual : plan.monthly * 12
      };
    });
  }

  /**
   * The winning plan at each balance band, cheapest upward.
   * Returns [{ plan, from }] with `from` the balance the band starts at.
   */
  function ladder(billing) {
    var plans = plansWithFees(billing);
    var bands = [];
    var current = plans[0];
    var floor = 0;

    for (var i = 0; i < MAX_RUNGS; i++) {
      bands.push({ plan: current, from: floor });

      var next = null;
      plans.forEach(function (plan) {
        if (plan.aer <= current.aer) return; // never worth more for savings
        var crossover = (plan.fee - current.fee) / (plan.aer - current.aer);
        // Must be above the current band's floor, and we want the earliest one.
        if (crossover > floor + 0.5 && (!next || crossover < next.at)) {
          next = { at: crossover, plan: plan };
        }
      });

      if (!next) break;
      floor = next.at;
      current = next.plan;
    }

    return bands;
  }

  function money(amount) {
    return '£' + Math.round(amount).toLocaleString('en-GB');
  }

  function rate(aer) {
    return (aer * 100).toFixed(2) + '% AER';
  }

  function price(plan, billing) {
    if (plan.fee === 0) return 'no fee';
    return billing === 'annual'
      ? money(plan.annual) + ' a year'
      : '£' + plan.monthly.toFixed(2) + ' a month';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderLadder() {
    var billing = state.billing;
    var bands = ladder(billing);
    var container = document.getElementById('ladder');
    container.textContent = '';

    bands.forEach(function (band, index) {
      var next = bands[index + 1];
      var isFirst = index === 0;

      var row = el('div', 'rung');

      var left = el('div', 'rung__balance');
      left.appendChild(el('div', 'eyebrow', isFirst ? 'below' : 'from'));
      var figure = el(
        'div',
        'rung__figure' + (isFirst ? ' rung__figure--base' : ''),
        money(isFirst ? (next ? next.from : 0) : band.from)
      );
      left.appendChild(figure);

      var right = el('div', 'rung__plan');
      right.appendChild(el('div', 'rung__name', band.plan.name));
      right.appendChild(
        el('div', 'rung__meta', rate(band.plan.aer) + '  ·  ' + price(band.plan, billing))
      );
      right.appendChild(
        el('div', 'rung__note', isFirst
          ? 'Beneath this, no paid plan recovers its fee. The free plan is the right answer.'
          : (next ? 'Ahead until ' + money(next.from) + '.' : 'Ahead from here upward.'))
      );

      row.appendChild(left);
      row.appendChild(right);
      container.appendChild(row);
    });
  }

  function renderAssumptions() {
    var top = data.plans[data.plans.length - 1];
    var parts = [
      'Flat balance over one year, rates unchanged, no boost rate.'
    ];
    if (data.topRateCap) {
      parts.push(
        top.name + ' ' + (top.aer * 100).toFixed(2) + '% to ' + money(data.topRateCap) + '.'
      );
    }
    parts.push(data.checked + '.');
    document.getElementById('assumptions').textContent = parts.join(' ');
  }

  function setBilling(billing) {
    state.billing = billing;
    document.querySelectorAll('.billing__btn').forEach(function (button) {
      var active = button.dataset.billing === billing;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderLadder();
  }

  document.querySelectorAll('.billing__btn').forEach(function (button) {
    button.addEventListener('click', function () {
      setBilling(button.dataset.billing);
    });
  });

  renderAssumptions();
  renderLadder();
})();
