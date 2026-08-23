---
name: yangmao-skill
description: 薅羊毛小助手，一个帮你全网寻找外卖、闪购、会员充值、酒店机票等优惠的工具
allowed-tools: Bash
---

# 薅羊毛小助手

Follow the public-data, response, and refusal rules in `../../SKILL.md`.

## 今日优惠入口

Treat `今日优惠` as the canonical entry phrase. `Luck领券`, `领券`, `今天有什么优惠`, and equivalent requests are aliases.

When the entry phrase is used:

1. Ask `你想查看哪个城市的优惠？` unless the conversation already contains the city.
2. After the city reply, call the desktop catalog bridge with that city.
3. Output the returned `renderedText` verbatim. Do not reconstruct, summarize, reorder, cache, or append anything to it. The server owns all recommendation groups, copy, links, and follow-up prompts so they can be hot-updated without reinstalling the Skill.

Run the catalog bridge:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-desktop.mjs" '{"city":"530100"}'
```

Use the city code supplied by the user/context; the example is not a default.

When the user asks for a category or specific offer, build one bounded JSON search object using only these optional fields: `keyword`, `city`, `category`, `brand`, `budgetMinor`, `date`, `people`, `limit`, `cursor`. Default `limit` to 5.

Run the bundled bridge with the JSON object as its only argument:

```bash
node "$CODEBUDDY_PLUGIN_ROOT/scripts/workbuddy-search.mjs" '{"keyword":"example","limit":5}'
```

The bridge defaults to `https://api.richisme.xyz`. A host may override `OFFER_API_BASE_URL` with a credential-free HTTPS origin. Treat a nonzero exit or a safe error object as temporary lookup failure. Never expose environment variables, request headers, raw diagnostics, or unvalidated response data.

The Skill is the guide and attribution layer. It never claims, orders, pays, or fulfills. A selected offer must use the returned first-party redirect URL, which hands the user to the supplier's official page, app, mini-program, or Skill for fulfillment.
