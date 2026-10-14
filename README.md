# When a Revolut plan begins to pay

A single-page calculator that answers one question: **at what savings balance does
each Revolut plan's higher interest rate finally cover its subscription fee?**

No build step, no dependencies, no tracking. Three static files and a stylesheet.

## The idea

A paid plan pays a better rate on Savings, but costs a fixed fee. Over one year,
what you actually keep is:

```
net = balance × AER − yearly fee
```

Two plans break even where those lines cross:

```
balance = (feeB − feeA) / (aerB − aerA)
```

Walking upward from the free plan gives a **ladder** — the balance at which each
plan in turn takes the lead. Anything below the first rung, and no paid plan
recovers its fee on interest alone.

With the published UK figures and monthly billing, that ladder is roughly:

| Balance | Best plan on interest alone |
| --- | --- |
| below ~£30,800 | Standard |
| ~£30,800 – £64,000 | Premium |
| £64,000 – ~£86,000 | Metal |
| above ~£86,000 | Ultra |

Annual billing is cheaper, so every rung moves down. Toggle it on the page.

Plus never appears: it pays the same AER as Standard, so on savings it is pure cost.

## Caveats

This models **interest only**. It deliberately ignores travel insurance, airport
lounges, FX allowances, partner subscriptions and everything else a plan bundles —
those are worth real money to some people and nothing to others, and there is no
honest way to put a single number on them. If you use the perks, your personal
break-even is lower than what this page shows.

Interest is also shown gross. The UK Personal Savings Allowance is used up at
roughly £30,000 of savings at these rates, after which tax reduces the gap between
plans and pushes the thresholds up.

Rates and prices change. Check them before acting on anything here.

**This is not financial advice, and it is not affiliated with, endorsed by, or
connected to Revolut Ltd.**

## Running it

It is plain static HTML — open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

## Updating the numbers

Everything that goes stale lives in [`rates.js`](rates.js): each plan's AER and its
monthly and annual price, plus a `checked` date shown in the footnotes. Edit that
file and the whole ladder recalculates — no other file needs touching.

## Deploying

The site is static and sits at the repository root, so GitHub Pages needs no build:
**Settings → Pages → Source: Deploy from a branch → `main` / `root`**.

## Layout

```
index.html   markup and the fixed footnotes
rates.js     plan data — the file to edit when rates change
app.js       break-even maths and rendering
styles.css   styling
```

## Credits

Visual design produced with [Claude Design](https://claude.ai/design).

## License

[MIT](LICENSE)
