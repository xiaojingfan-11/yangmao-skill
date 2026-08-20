# Agent Coupon Skill

Public thin client for querying current, server-verified offers. It does not claim coupons, log in, order, pay, redeem, generate partner links, or contain private backend logic.

## Development

Requires Node.js 24 LTS and pnpm 11.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm security:boundary
```

Configure an HTTPS API base URL in the host application. Never commit credentials.

## Runtime contract

- API base URL must use HTTPS and contain no credentials, query, or fragment.
- Client requests `POST /v1/offers/search` with public fields only.
- Default timeout is 8 seconds; callers may set `timeoutMs` from 1 to 30,000.
- Responses are rejected unless they match the bounded public schema.
- Only server-returned HTTPS redirect URLs may be shown or opened.

After deploying the private API and first-party redirect domain, verify their public contract:

```powershell
$env:OFFER_API_BASE_URL = 'https://api.example.com'
$env:EXPECTED_REDIRECT_ORIGIN = 'https://go.example.com'
pnpm smoke:contract
```

The smoke command prints aggregate status only. It does not print offer data, cursors, or redirect tokens.
