# Public Skill Contract

The private backend owns supplier access, ranking, promotion-link generation, attribution, orders, commissions, and risk controls. This repository owns only public request validation, response validation, and presentation rules.

## Compatibility baseline

- Endpoint: `POST /v1/offers/search`
- Entry navigation: `GET /v1/offers/today` returns current total and nonempty category counts without generating promotion links
- Canonical entry phrase: `今日优惠`; asks for a city, then directly lists all returned Skill-selected activities
- Dashboard handoff: presentation ends with `https://luck.richisme.xyz/`
- Catalog updates: publication changes are server-side and require no installed-Skill update
- Scope: inventory without a supplier city is labeled `全国可用`, never city-local
- Maximum results per request: 5; canonical entry follows opaque cursors up to 20 displayed activities
- Pagination: opaque `cursor`; clients never inspect or modify it
- Money: integer CNY minor units or null
- Redirect: HTTPS URL returned by the backend; clients never construct supplier URLs
- Errors: stable client categories without upstream messages
- Secrets: none in configuration, requests, output, logs, fixtures, or Git

## Release gate

Before pointing a published Skill at an environment:

1. Public and private repository CI must pass.
2. `pnpm smoke:contract` must pass against the deployed API and first-party redirect origin.
3. The redirect domain must be controlled by the project and use HTTPS.
4. A real supplier-attributed test order must be reconciled in the private backend before claiming the commercial loop is complete.
