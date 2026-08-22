---
name: agent-coupon
description: Use when a user wants current, verifiable coupons, discounts, group-buying offers, meal deals, or a safe redemption link.
allowed-tools: Bash
---

# Luck Coupon Guide

Follow the public-data, response, and refusal rules in `../../SKILL.md`.

## 今日优惠入口

Treat `今日优惠` as the canonical entry phrase. `Luck领券`, `领券`, `今天有什么优惠`, and equivalent requests are aliases.

When the entry phrase is used:

1. Ask `你想查看哪个城市的优惠？` unless the conversation already contains the city.
2. After the city reply, call the catalog bridge with that city and read its `activities` array.
3. Present every returned activity directly. Do not show category counts and do not ask the user to choose a category first.

Run the catalog bridge:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-catalog.mjs" '{"city":"530100"}'
```

Use the city code supplied by the user/context; the example is not a default.

Number every returned activity. Show exact title, summary, scope, and validity when returned. Since offers with no city are nationwide, label them `全国可用`. Never describe nationwide offers as local merchant offers. The catalog does not return claim links; when the user selects one activity, use the search bridge to obtain its first-party claim URL.

After all offer content, add this final line and nothing below it:

```text
🌐 查看完整优惠看板：
https://luck.richisme.xyz/
```

Keep the dashboard link at the bottom so it does not interrupt the conversation.

When the user asks for a category or specific offer, build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The host must provide `OFFER_API_BASE_URL` as a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.

The Skill is the guide and attribution layer. It never claims, orders, pays, or fulfills. A selected offer must use the returned first-party redirect URL, which hands the user to the supplier's official page, app, mini-program, or Skill for fulfillment.
