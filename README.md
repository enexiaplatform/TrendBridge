# TrendBridge

Global product validation: product input → free snapshot → gated full report → validation tools.

## Current implementation

- English-default core journey, persisted EN/VI interface preference and independent report-language selection.
- Market/channel/currency scope for US, Vietnam, UK, Germany and Australia. Scope support does not imply live market-data coverage.
- Persistent product-specific snapshots and research history. No timed processing simulation or fixed report redirect.
- Deterministic per-unit economics, explicit unknowns, user-supplied FX and an interactive price sandbox.
- Versioned research schemas for sources, claims, comparable listings, supplier references, risks and validation experiments.
- Server-side owner and entitlement checks; locked report data is omitted from the response, not hidden in the UI.
- Clearly labeled development-only fixture unlock. No Manus calls, charge or credit consumption occurs.
- UTF-8 print view (browser Save as PDF), editable XLSX workbook and English/Chinese RFQ drafts, all from the saved report.
- Dormant Manus API v2 adapter with private tasks, structured output schema and bounded request timeout.
- An additive Supabase migration restricts raw reports and privileged writes to the server.
- Official owner-supplied logo and a commercial design system at `/design-system`.

## Run locally

Use Node 22.22.2+ or a compatible newer version.

```sh
npm ci
npm run dev
```

Without Supabase configuration, local development uses `.data/research.sqlite` and an HttpOnly browser workspace cookie. Reports survive server restarts. Clearing the cookie loses access to that local workspace. This local store and fixture unlock are disabled in production.

Copy `.env.example` to `.env.local` when configuring Supabase. Never commit credentials.

## Checks

```sh
npm run check
```

Includes financial/schema/evidence/storage/export tests, embedded Postgres migration/privilege tests and the production build. Embedded Postgres tests use PGlite with an Auth schema stub; they are not evidence of a live Supabase Auth or production RLS acceptance run.

With the local dev server running, run HTTP integration tests:

```sh
TB_HTTP_ORIGIN=http://localhost:3000 npx vitest run tests/http.test.ts
```

PowerShell equivalent: set `$env:TB_HTTP_ORIGIN='http://localhost:3000'` before invoking Vitest. GitHub CI runs both the normal quality gate and the HTTP integration suite.

## Production prerequisites

Set the Supabase URL, publishable key and server-only secret key. Inspect the target database and migration ledger before applying the migrations. Enable Supabase anonymous sign-ins only with appropriate abuse controls if allowing free snapshots without registration; otherwise customers sign in first. Configure hosting-level rate limits. Missing production storage returns 503 instead of an ephemeral success.

Manus live research, its durable worker/event reconciliation, independent evidence validation and a verified global payment provider remain disabled pending a live pilot. Full reports are not currently on sale. No external source research, paid fulfillment, live account isolation or production deployment is claimed operational by this repository.

## Documentation

- [Global research contracts and readiness boundaries](docs/GLOBAL_RESEARCH.md)
- [Brand and design system](docs/DESIGN_SYSTEM.md)
- [Manus task API](https://open.manus.im/docs/v2/task.create)
- [Manus lifecycle](https://open.manus.im/docs/v2/task-lifecycle)
