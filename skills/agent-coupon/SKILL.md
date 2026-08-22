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

1. Call the catalog immediately without a city. The server owns the current curated assortment.
2. Present only nonempty categories returned by the API. Prefer the user-facing labels `外卖红包`, `咖啡奶茶`, and `品牌点餐` for the corresponding server categories.
3. Ask for a city only when the user explicitly requests city-local inventory. Never imply that nationwide activity eligibility is guaranteed in every city.

Then run the catalog bridge:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-catalog.mjs" '{}'
```

Present the returned total and every nonempty category as the navigation menu. Do not invent a city or count. Since offers with no city are nationwide, label the current catalog `全国可用` unless the API explicitly returns city-local inventory. Never describe nationwide offers as local merchant offers.

Ask the user to reply with a category label. After all offer content, add this final line and nothing below it:

```text
🌐 查看完整优惠看板：
https://luck.richisme.xyz/
```

Keep the dashboard link at the bottom so it does not interrupt the conversation.

When the user selects a category or asks for a specific offer, build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The host must provide `OFFER_API_BASE_URL` as a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.

The Skill is the guide and attribution layer. It never claims, orders, pays, or fulfills. A selected offer must use the returned first-party redirect URL, which hands the user to the supplier's official page, app, mini-program, or Skill for fulfillment.
