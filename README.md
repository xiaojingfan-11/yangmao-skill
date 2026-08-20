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
