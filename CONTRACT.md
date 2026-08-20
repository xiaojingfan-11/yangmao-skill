# Public Skill Contract

The private backend owns supplier access, ranking, promotion-link generation, attribution, orders, commissions, and risk controls. This repository owns only public request validation, response validation, and presentation rules.

## Compatibility baseline

- Endpoint: `POST /v1/offers/search`
- Maximum results: 5
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
