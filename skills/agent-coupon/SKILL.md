---
name: agent-coupon
description: Use when a user wants current, verifiable coupons, discounts, group-buying offers, meal deals, or a safe redemption link.
allowed-tools: Bash
---

# Luck Coupon Guide

Follow the public-data, response, and refusal rules in `../../SKILL.md`.

When the user says `Luck领券`, `领券`, `今天有什么优惠`, or an equivalent entry request, run the catalog bridge first:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-catalog.mjs" '{"city":"optional-city-code"}'
```

Present the returned total and every nonempty category as the navigation menu. Do not invent a city or count. Ask the user to reply with a category label.

When the user selects a category or asks for a specific offer, build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The host must provide `OFFER_API_BASE_URL` as a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.

The Skill is the guide and attribution layer. It never claims, orders, pays, or fulfills. A selected offer must use the returned first-party redirect URL, which hands the user to the supplier's official page, app, mini-program, or Skill for fulfillment.
