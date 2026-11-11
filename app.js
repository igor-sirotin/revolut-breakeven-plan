/**
 * Works out, for every balance, which Revolut plan leaves you with the most
 * money after a year — interest earned minus subscription paid — and renders
 * the resulting ladder of crossover points.
 *
 * Net return for a plan at balance b, over one year:  b * aer - fee
 * Two plans break even where  b * aerA - feeA = b * aerB - feeB, i.e.
 *   b = (feeB - feeA) / (aerB - aerA)
 * A plan with a `cap` pays `capAer` on the part of the balance above it, so
 * its net line bends at the cap. Between consecutive caps every line is
 * straight, so we collect each pairwise crossover inside each such segment,
 * then find the winner between neighbouring points and merge equal winners.
 */
(function () {
  'use strict';

  var data = window.REVOLUT_DATA;

  var state = { billing: 'monthly' };

  /** Yearly cost of each plan under the selected billing period. */
  function plansWithFees(billing) {
    return data.plans.map(function (plan) {
      return {
        name: plan.name,
        aer: plan.aer,
        cap: plan.cap,
        capAer: plan.capAer,
        monthly: plan.monthly,
        annual: plan.annual,
        fee: billing === 'annual' ? plan.annual : plan.monthly * 12
      };
    });
  }

  /** Net line of a plan on a segment that starts at `from`: { slope, at0 }. */
  function lineFrom(plan, from) {
    if (plan.cap && from >= plan.cap) {
      return {
        slope: plan.capAer,
        at0: plan.cap * (plan.aer - plan.capAer) - plan.fee
      };
    }
    return { slope: plan.aer, at0: -plan.fee };
  }

  function net(plan, balance) {
    var line = lineFrom(plan, balance);
    return balance * line.slope + line.at0;
  }

  /** Earlier plans win ties, so a free plan beats a paid one at equal net. */
  function bestAt(plans, balance) {
    var best = plans[0];
    plans.forEach(function (plan) {
      if (net(plan, balance) > net(best, balance) + 1e-9) best = plan;
    });
    return best;
  }

  /**
   * The winning plan at each balance band, cheapest upward.
   * Returns [{ plan, from }] with `from` the balance the band starts at.
   */
  function ladder(billing) {
    var plans = plansWithFees(billing);

    var edges = [0];
    plans.forEach(function (plan) {
      if (plan.cap) edges.push(plan.cap);
    });
    edges.sort(function (a, b) { return a - b; });

    var points = edges.slice();
    edges.forEach(function (start, e) {
      var end = e + 1 < edges.length ? edges[e + 1] : Infinity;
      plans.forEach(function (a) {
        plans.forEach(function (b) {
          var la = lineFrom(a, start);
          var lb = lineFrom(b, start);
          if (la.slope === lb.slope) return;
          var at = (lb.at0 - la.at0) / (la.slope - lb.slope);
          if (at > start && at < end) points.push(at);
        });
      });
    });
    points.sort(function (a, b) { return a - b; });

    var bands = [];
    points.forEach(function (from, p) {
      var to = p + 1 < points.length ? points[p + 1] : from * 2 + 1;
      var winner = bestAt(plans, (from + to) / 2);
      var last = bands[bands.length - 1];
      if (!last || last.plan !== winner) bands.push({ plan: winner, from: from });
    });

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
    var parts = [
      'Flat balance over one year, rates unchanged, no boost rate.'
    ];
    data.plans.forEach(function (plan) {
      if (!plan.cap) return;
      parts.push(
        plan.name + ' ' + (plan.aer * 100).toFixed(2) + '% to ' + money(plan.cap) +
        ', ' + (plan.capAer * 100).toFixed(2) + '% above.'
      );
    });
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
