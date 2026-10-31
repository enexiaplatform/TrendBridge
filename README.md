# TrendBridge

Global market intelligence and GTM planning: product scope → customer and competitive thesis → channel economics → launch decisions. Research inputs and planning assumptions remain distinct from verified market findings.

## Current implementation

- Precision Desk case design: compact rail, linked chart/table selection, contextual market/GTM views and a scrolling inspector; mobile editing uses a full-screen sheet.
- English-default core journey, persisted EN/VI interface preference and independent report-language selection.
- Market/channel/currency scope for US, Vietnam, UK, Germany and Australia. Scope support does not imply live market-data coverage.
- Persistent product-specific snapshots and research history. No timed processing simulation or fixed report redirect.
- Deterministic per-unit economics, explicit unknowns, user-supplied FX and saved financial scenarios.
- First-class Market Intelligence and GTM Strategy sections: selectable segment/competitive maps, monthly signals with gaps, positioning, channel conversion sensitivity, contribution comparison and a thirteen-week rollout.
- A private, saved Market & GTM brief with vector charts, source appendix and dedicated workbook sheets; strategic inputs feed deterministic plan starters and invalidate stale reviews.
- Opportunity shortlist with four-case comparison, stage/project filters and recoverable case archiving.
- Private user-supplied research collection, comparable price grid, supplier quote terms and source-freshness checks.
- Twelve-month launch cash/inventory planning, funding gaps, named scenarios and a signed cash chart.
- Ten-section business plan with scope-based starter drafts, linked evidence, stale review detection and bounded plan history.
- Validation tracker and append-only decisions with pinned source snapshots; independent owner-checked planning exports.
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
TB_HTTP_ORIGIN=http://localhost:3000 npx vitest run tests/http.test.ts tests/launch-http.test.ts --maxWorkers=1
```

PowerShell equivalent: set `$env:TB_HTTP_ORIGIN='http://localhost:3000'` before invoking Vitest. GitHub CI runs both the normal quality gate and the HTTP integration suite.

## Production prerequisites

Set the Supabase URL, publishable key and server-only secret key. Inspect the target database and migration ledger before applying the migrations. Enable Supabase anonymous sign-ins only with appropriate abuse controls if allowing free snapshots without registration; otherwise customers sign in first. Configure hosting-level rate limits. Missing production storage returns 503 instead of an ephemeral success.

Private production persistence was verified on 2026-10-29 with real Supabase Auth sessions: creation, retry idempotency, saved workspace reload, history, exports, cross-owner denial, stale-write rejection and paid report locks. The deployment uses the isolated `trendbridge` schema and server-only document access. Guest research belongs to the anonymous browser identity; clearing its Auth cookies loses access. Cross-device recovery and team accounts are not established by this checkpoint. See the [connection and acceptance guide](docs/SUPABASE_CONNECTION.md).

An optional real-cloud regression suite accepts `TB_CLOUD_ORIGIN=https://your-deployment.example` and runs `npx vitest run tests/cloud-storage.test.ts --maxWorkers=1`. It creates two anonymous QA accounts/cases and is skipped during normal CI; use the emitted QA case IDs for scoped operator cleanup. Never supply a real user's cookies. Running this suite is an explicit mutation of the selected deployment.

Manus live research, its durable worker/event reconciliation, independent evidence validation and a verified global payment provider remain disabled pending a live pilot. Full reports are not currently on sale. A successful hosting deployment alone does not establish those capabilities. The research collection contains user-supplied references, not market-wide data.

## Documentation

- [Global research contracts and readiness boundaries](docs/GLOBAL_RESEARCH.md)
- [Brand and design system](docs/DESIGN_SYSTEM.md)
- [Feature blueprint and reference research](docs/PRODUCT_BLUEPRINT_V2.md)
- [Implemented checkpoints, limits and operator guide](docs/IMPLEMENTATION_V2.md)
- [Supabase connection and production acceptance](docs/SUPABASE_CONNECTION.md)
- [Market Intelligence, GTM and visualization contracts](docs/MARKET_INTELLIGENCE_GTM.md)
- [Manus task API](https://open.manus.im/docs/v2/task.create)
- [Manus lifecycle](https://open.manus.im/docs/v2/task-lifecycle)
