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

## WorkBuddy / CodeBuddy

The repository includes `.workbuddy-plugin/plugin.json`, `.codex-plugin/plugin.json`, and a namespaced Skill under `skills/`. Set `OFFER_API_BASE_URL` to the production HTTPS API origin before loading the plugin. The bundled bridge accepts one bounded JSON search object, uses an eight-second timeout, and prints JSON only.

## Cross-agent access

Agents that cannot install this Skill can import the public OpenAPI contract from `https://api.richisme.xyz/openapi.json`. A browser-only client can open `https://luck.richisme.xyz/`; its selected city is stored on that device and included in the URL for sharing.

MCP-capable desktop agents can launch the bundled stdio server with `pnpm mcp`. It exposes `get_today_offers` and `search_offers`; both use the same public API and contain no supplier credentials.
