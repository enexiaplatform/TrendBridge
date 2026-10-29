# TrendBridge v2 — implementation checkpoints

Date: 2026-10-29. Scope: functional planning/research workspace while live Manus, paid checkout and scheduled monitoring remain disabled as requested. This is not a declaration that all commercial launch requirements have passed.

## Step 1 — opportunity workflow

Implemented at `/dashboard`: up to four selected cases in a comparison table, project/shortlist labels, stage filters, archived view, restoreable case archiving and saved device filters. Case links retain the original research record. Table discloses configuration, market/channel/currency, original financial assumptions, cash-model readiness, missing inputs, next experiment and last decision. No automatic winning score.

The project field is a grouping label within an owner's cases, not a new shared-project authority. The existing `public.projects` table was inspected; no duplicate projects table is created. Durable project membership/team permissions remain a separate migration and acceptance milestone.

## Step 2 — research, comparables and source freshness

Implemented inside Launch workspace → Evidence & comparables: manual market, competitor, customer and supplier records; HTTPS source, excerpt, observation date, configuration, limitations, price/currency/pack size and comparable/partial/excluded classification. Supplier terms include MOQ, incoterm, lead days, quote expiry and payment terms. Unit prices are normalized only when a pack size exists; currencies are retained separately.

`/research-collection` searches and filters saved observations across private cases. Coverage is explicitly limited to 100 latest cases and 500 observations. It is not a syndicated market dataset. No synthetic sales, historical demand, supplier identity checks or extracted review statistics are shown.

Deterministic quality checks flag observations older than 30 days, expired quotes, missing configuration/pack and duplicate URLs. They do not retrieve source pages or establish authenticity. Observation and quote updates do not automatically change financial assumptions.

Manual TAM/SAM/SOM tool retains relevant customer population, annual category spend, serviceable fraction, reachable customers and evidence IDs. Reach cannot exceed the serviceable population; missing inputs remain unknown. These are assumptions, not purchased market data.

## Step 3 — cash and inventory planning

Implemented inside Launch workspace → Launch cash plan: 12 monthly order/sales/fixed-cost rows; starting cash and paid inventory; price, purchase/fulfillment/packaging/acquisition cost; channel/payment fee; refunded revenue; setup cost; delivery and payout lags; supplier deposit. Copying original unit assumptions is an explicit user action and does not mutate the baseline.

Outputs: signed closing-cash chart plus accessible table, stockout flags, gross sales/fees/refunds/COGS in workbook, operating result, minimum cash, additional funding gap, receipts and supplier commitments beyond month 12. Up to three named cash scenarios can be captured and reloaded.

Calculation rules: supplier deposit on order, balance on arrival; sales net of fees/refunds collected after the selected lag; variable costs paid in sale month. Returned units are not resold, channel fees not refunded. No opening receivables/payables, loans, interest, tax engine or full accounting balance sheet. Costs already bundled in another input must not be entered twice. Cents are used for monetary ledgers (whole units for VND); oversized models are rejected. Delivery/payout lag range is 0–3 months. Stockout schedules remain visible as infeasible drafts and do not provide an actionable funding-gap result.

## Step 4 — linked business plan and exports

Implemented ten editable plan blocks, linked evidence, deterministic scope-based starter drafts, explicit review acknowledgments and dependency invalidation. Starter drafts use only saved scope/assumptions and open questions; they are not AI market conclusions. Changed cash, sizing, evidence or tests make prior reviews stale. Existing prose is not overwritten automatically.

The server creates revision numbers and retains the ten latest written plan versions, including cash and sizing assumptions. Users can inspect historical prose and download a JSON backup. This is bounded plan history, not an indefinite enterprise audit archive.

Free planning exports: owner-checked HTML for browser Print → PDF, Excel with separate scope, assumptions, cash/stock, plan, evidence, quote terms, sizing, scenario inputs/results, validation, decisions, pinned evidence and plan history. These export user planning data, not locked paid research. Unsaved JSON downloads are marked draft; saved server exports use the current saved revision. Structured export headings are currently English; user-authored content remains Unicode and in its original language.

## Step 5 — validation and decisions

Implemented experiments with hypothesis, method, owner, due date, cap, actual spend, pass/stop conditions, result and evidence links. Starting requires a cap and criteria. Closing requires a result and criteria; Passed also requires recorded spend within budget. These are user-recorded outcomes, not AI verification.

Continue / Revise / Stop decisions are appended by the server, with rationale and up to five pinned evidence snapshots. Later changes/removal from the working collection do not remove that pinned context. The bounded pilot allows thirty decision entries per case. A stale write returns 409 and leaves the browser draft available.

## Step 6 — storage and access

Current pilot storage reuses the existing owner-scoped `validation_runs.document` and SQLite store; it adds an optional strict, bounded `trendbridge.workspace/v1` field. Existing reports read without a workspace and receive safe empty defaults in the UI. No migration or credential/security change is required for this checkpoint. Changes use the same atomic `updatedAt` compare-and-swap as scenario saves/unlock, preventing one feature from silently overwriting another.

Incoming data cannot set entitlements, decisions, server revision or plan history. Local storage remains unavailable in production by design; production needs the existing authenticated Supabase configuration. Local SQLite/HTTP and PGlite checks do not establish live Supabase acceptance. At larger scale, normalize observations, plan versions and collaboration against the existing schema with an explicitly tested migration rather than growing the per-case envelope indefinitely.

## Step 7 — external capabilities and commercial gates

`/api/capabilities` makes current coverage explicit. Live research, automatic URL extraction, market-wide data, paid unlock and scheduled refresh are false. Existing Manus transport remains dormant; this implementation does not establish a working live research-job pipeline.

Before activating phase 4 of the blueprint: verify current official Manus API, implement durable jobs with budget/retry/cancellation/reconciliation, connect legitimately usable data, test claim/source matching against independently reviewed real cases, and measure quality/cost. Schema validation and deterministic freshness checks are not semantic source verification.

Before phase 5: validate a paid offer and supported scope, integrate verified payment fulfillment/idempotency/refunds, complete legal/privacy/source-rights review and run production auth/storage/entitlement tests. No price, paid order, external supplier contact or test result is invented here.

Before phase 6: connect licensed/authorized repeatable data, implement observation refresh/diff and actual notification preferences, then add team membership and collaboration against durable project identities. No automation or outbound notification is created by this work.

## Verification evidence

Local browser flow exercised: create a case → assign project/stage → add a clearly marked QA source → enter twelve-month cash assumptions → capture scenario → save → edit/review plan → attempt an unbudgeted running test (blocked) → add cap → save → observe stale plan → pin evidence to a decision → save/reload → compare two cases. A complete HTML/XLSX export is covered by integration and domain tests; real downloads are checked separately in the browser.

Independent calculation cases cover missing/zero inputs, deposits, arrivals, payout lag, unsold inventory vs COGS, zero-lag cash, refunds, negative cash, stockouts, year-end commitments, unsafe numeric ranges, and row-wise cash/stock reconciliation. Additional tests cover owner isolation, entitlement preservation, cross-origin/malformed input, stale/concurrent writes, plan invalidation/version limits, pinned sources, HTML escaping and spreadsheet text.

Evidence directory: `.artifacts/launch-v2/` (ignored local artifacts). Release/check status and runtime limitations must be reported from the actual final run, not inferred from this checklist.

Final local checkpoint: 38 domain/storage/export tests and 3 HTTP tests passed; production build and type checking passed. A browser-downloaded workbook was read back and matched revision 5 and month-12 cash 2091.5. Public production-build sample was opened and its navigation/cash tool exercised; console warnings/errors were empty. Private-case browser flows were exercised in development storage, not claimed as authenticated production acceptance. The exact GitHub CI/deployment result is reported separately at release time.

## How to use

1. Create a free case, then open **Launch workspace**.
2. Set project label and stage; save.
3. Add source records and quote terms; explicitly retain limitations.
4. Complete cash assumptions and all twelve months, including explicit zeroes.
5. Capture scenarios; write/review the business plan against current assumptions.
6. Set a capped test, record the actual result, then append a decision with relevant evidence.
7. Return to Workspace, select two to four cases and compare. Use Library for existing research reports and Research collection for your cross-case observations.

No configuration secret is needed for the local development flow. A deployed public sample supports draft exploration but deliberately cannot persist edits.
