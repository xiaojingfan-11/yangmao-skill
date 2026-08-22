---
name: yangmao-skill
description: Use when a user wants current, verifiable coupons, discounts, group-buying offers, meal deals, or a safe redemption link.
allowed-tools: Bash
---

# 羊毛优惠

Follow the public-data, response, and refusal rules in `../../SKILL.md`.

## 今日优惠入口

Treat `今日优惠` as the canonical entry phrase. `Luck领券`, `领券`, `今天有什么优惠`, and equivalent requests are aliases.

When the entry phrase is used:

1. Ask `你想查看哪个城市的优惠？` unless the conversation already contains the city.
2. After the city reply, call the catalog bridge with that city and read its `activities` array.
3. Present two blocks only: `折扣促销` using `promotions`, then `领券优惠` using `coupons`. Preserve server ranking; do not show category navigation.

Run the catalog bridge:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-catalog.mjs" '{"city":"530100"}'
```

Use the city code supplied by the user/context; the example is not a default.

Number the items separately in each block. Show `valueText`, exact title, and summary. Under every item add `[查看并领取](detailUrl)` using the returned URL unchanged. Show at most 10 per block. If fewer are returned, show fewer; never infer a discount or coupon amount from prose.

After all offer content, add this final line and nothing below it:

```text
🌐 更多优惠点击打开：
https://luck.richisme.xyz/?city={cityCode}
```

Keep the dashboard link at the bottom so it does not interrupt the conversation.

When the user asks for a category or specific offer, build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The bridge defaults to `https://api.richisme.xyz`. A host may override `OFFER_API_BASE_URL` with a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.

The Skill is the guide and attribution layer. It never claims, orders, pays, or fulfills. A selected offer must use the returned first-party redirect URL, which hands the user to the supplier's official page, app, mini-program, or Skill for fulfillment.
