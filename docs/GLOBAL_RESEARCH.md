# Global Product Validation — implementation receipt

## Active scope

- English-default interface with a persisted EN/VI switch for the core journey.
- Independent target market, channel, report language, selling currency and purchase currency.
- US, VN, GB, DE and AU scope configurations. These are scope options, not a claim of live evidence coverage.
- A three-step wizard produces a real, saved Free Snapshot from user inputs.
- Unknown costs remain null. No implicit FX or marketplace fee defaults. All monetary amounts are per-unit.
- Deterministic sandbox calculations require complete cost inputs. Tax, returns, packaging and fixed costs are excluded unless included in user-entered costs.
- Reports and history use persistent IDs. The old timed processing demo is removed.
- Full data is projected server-side only after an entitlement check. Raw report documents are not accessible through the Supabase customer Data API.
- Local-only test unlock generates clearly labeled hypotheses with no fictional observations. It is disabled in every production deployment.
- Print-ready UTF-8 HTML (browser Save as PDF) and an XLSX workbook derive from the same saved report. Financial workbook formulas remain editable. This release does not claim a server-rendered binary PDF engine.

## Contracts

`trendbridge.snapshot/v1`: product scope, financial outputs, unknown inputs, evidence availability, unresolved questions and locked module descriptions.

`trendbridge.research/v1`: product configuration, sources, claims and unresolved questions. Each claim belongs to a fixed report module and includes finding, implication, limitation and next action. Observations require a source reference and excerpt; hypotheses remain distinct.

`trendbridge.report/v1`: the user-facing rendering/export contract across investment memo, market, competition, customer needs, sourcing, economics, differentiation, risk, validation and evidence ledger.

The evidence gate validates shape, source references, duplicate IDs and timestamps. It does NOT prove that a remote page supports a claim, that the supplier is legitimate, that a quote remains available, or that the underlying data is licensed. Live publication needs independent content checks, configuration matching, freshness policy and contradiction review. No route currently ingests or publishes a live Manus result.

## Manus boundary

The dormant API v2 transport supports task creation, detail and message retrieval. Prompts use private tasks and a JSON Schema, declare untrusted input, forbid autonomous transactions/messages, require evidence and explicitly allow unavailable results. `MANUS_LIVE_ENABLED=false` is the default; no app route calls the adapter. API credentials stay server-side.

References checked on 2026-10-28:

- https://open.manus.im/docs/v2/task.create
- https://open.manus.im/docs/v2/task-lifecycle

Before enabling Manus: finish the durable worker, authenticated webhook delivery or bounded polling, signature verification/reconciliation, waiting-state handling, artifact retention, spend limits and live report-quality audits. `agent_status=stopped` is not terminal when background jobs remain active.

## Persistence and deployment

Local development without Supabase uses Node SQLite in `.data/research.sqlite`. A random 256-bit HttpOnly SameSite cookie scopes each browser workspace. Data survives reloads and server restarts; losing the cookie loses access to that local workspace. This is not a substitute for a production user account. Local storage and test unlock are explicitly rejected when NODE_ENV=production.

Production requires Supabase URL, publishable key and server-only secret key plus both migrations. Verified Supabase user IDs scope every server query. Supabase anonymous sign-in may support free previews if explicitly enabled in the project; otherwise users are asked to sign in. Configure Supabase anonymous-auth abuse controls/CAPTCHA and hosting rate limits before opening production preview traffic. Per-owner limits alone do not prevent an attacker creating new guest identities.

The additive migration creates a server-only `validation_runs` table and a service-only creation RPC. Owner-level locks serialize idempotency and hourly preview limits (10/hour/owner). It also revokes old client write access to reports, evidence, orders and roles. Existing read policies are retained. Do not apply migrations blindly to an existing shared database; inspect the target and current ledger first.

Production with missing storage returns 503 and never returns an ephemeral “queued” success. Do not deploy SQLite storage onto ephemeral/serverless production disks.

## Commerce

No paid offer or merchant is active. The global billing page publishes no invented USD price. Unlock in production returns a clear 503 until research and verified payment fulfillment are available. Webhooks return 503 and never mark an order paid from an unvalidated generic signature.

The next commerce milestone requires amount/currency verification against the authoritative provider order, unique event IDs, a transactional entitlement/credit ledger, retry-safe fulfillment, a refund/restoration workflow and legal review of customer terms. Keep test entitlements distinct from paid entitlements throughout.

## Validation

- `npm run check`: type checking, domain/export/storage tests, production build.
- With a local dev server, run `TB_HTTP_ORIGIN=http://localhost:3000 npx vitest run tests/http.test.ts` (use the equivalent environment syntax on Windows).
- HTTP suite verifies persistence, idempotency, owner isolation, locked exports, local fixture unlock, XLSX output and malformed/cross-origin requests.
- `supabase test db` exercises the included database privilege tests when Docker and a local Supabase instance are available. Database/live account tests must not be reported as passed unless actually executed.

## Saved financial scenarios (2026-10-28)

Each private report can retain five user-defined financial scenarios, including a rationale. Currency, market and product scope remain fixed to the original report; price, purchase cost, shipping, acquisition cost, fee and FX may vary. Empty inputs remain unknown. Comparison charts and tables use deterministic calculations only, with negative contribution visible. This tool is available in the free preview; full report exports remain entitlement-gated. Public samples support draft calculation but cannot save.

Scenarios are stored inside the existing owner-scoped validation run document. No new table or migration is needed. Saves and removals use atomic compare-and-swap against the document's `updatedAt` in both SQLite and Supabase; stale writes return 409 instead of erasing another change or entitlement. Unlock uses the same concurrency check. Existing documents without scenarios read as an empty list.

Unlocked HTML/PDF and Excel exports include saved scenarios, their inputs and rationale. Excel adds editable formulas with the same cached calculation results shown in the app. Unsaved drafts and the separate price sandbox are excluded. Live Supabase/PostgREST acceptance remains pending; local storage, domain, export and HTTP checks do not establish production acceptance.

## Remaining commercial launch work

The selected Research Workbench now integrates the financial model, persistent scenarios, report sections and validation actions in one case workspace. Intake supports validated local draft restoration and accepts unknown costs; library search uses owner-scoped saved records. No new external provider or paid entitlement is enabled by this interface upgrade. The previous separate price sandbox has been replaced by the unified scenario editor; unsaved drafts remain excluded from exports.

Live Manus orchestration and evidence verification, measured pricing, a global merchant/payment integration, complete translation of all report narrative templates, validated market-specific regulatory/fee references, production analytics and live authenticated/Supabase acceptance. The public sample is a test template, not a production research result.
