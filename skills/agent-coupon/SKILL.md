---
name: agent-coupon
description: Use when a user wants current, verifiable coupons, discounts, group-buying offers, meal deals, or a safe redemption link.
allowed-tools: Bash
---

# Find Verifiable Offers

Follow the public-data, response, and refusal rules in `../../SKILL.md`.

Build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The host must provide `OFFER_API_BASE_URL` as a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.
