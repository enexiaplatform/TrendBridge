# Manus API v2 — controlled private pilot (pre-activation)

## Scope and hard boundaries
This change adds an owner-gated, manually initiated API pilot. It does not turn on paid reports, auto-publish research, grant entitlements, or promise a monetary cost ceiling.

- A single job can be submitted in a 24-hour window (database-enforced, globally), and a single task can be active at once.
- Each job can be dispatched only once; ambiguous POST timeouts require operator reconciliation instead of a second potentially paid task.
- Provider event retrieval updates a durable service-only job row. No client can read stored provider results through the Data API.
- Structural schema and source-ID validation are not independent checking of the remote page. Valid output is marked `qa_pending`, not customer-visible.
- Provider credit_usage is recorded where available; monetary value and hard spend enforcement are **not verified**. Configure spending limits in the Manus account before any pilot.
- Polling is opportunistic via authenticated user GET (minimum 60-second interval); a verified webhook can also reconcile on task_stopped. Neither is a dedicated continuously running worker.

## Deployment preparation
1. Review the current repo, existing `trendbridge.validation_runs` schema, and connection metadata. **Do not target an unrelated Supabase app.**
2. Run the additive SQL `supabase/bootstrap/manus-pilot.sql` against the same database/schema as the existing TrendBridge research data. No public tables should be changed.
3. Configure Vercel project `trend-bridge` **server-only** variables:
   - `MANUS_API_KEY`: **newly rotated** key; encrypted, never `NEXT_PUBLIC_`, never commit it.
   - `MANUS_PILOT_OWNER_ID`: exact Supabase Auth user UUID of the approved pilot operator. This is a security boundary; it cannot be guessed from existing research records.
   - `MANUS_LIVE_ENABLED=false`: keep disabled for first deployment and inspection.
   - `MANUS_WEBHOOK_URL`: exact public HTTPS URL if registering a webhook (optional for manual polling).
   - Existing `SUPABASE_RESEARCH_SCHEMA=trendbridge`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` must remain working and server-side as appropriate.
4. Build, run test suite and verify /api/capabilities and anonymous users cannot start the pilot.
5. Only **after a separate explicit go-ahead for billable API calls**, enable `MANUS_LIVE_ENABLED=true` for an isolated preview environment and deploy. One authenticated allowlisted owner may press `Run one Manus research test` in a saved report.
6. For webhook delivery, register the URL via Manus developer settings. Webhook must match `MANUS_WEBHOOK_URL` byte-for-byte including query string, use HTTPS, and verify the RSA signature before any reconciliation. A manual poll fallback is available.
7. Independently open every cited page and compare each material claim to the text, configuration and retrieval date. Mark discrepancies, cost in credits, and whether the case can proceed.

## Current operator limitations
- A Vercel 403 on environment-variable writes means integration cannot be made key-ready from this connector session. Use an authorized Vercel team member or a properly scoped Vercel CLI session. Do **not** paste your key into a chat or commit.
- Current pilot intentionally requires both `MANUS_API_KEY` and an explicit `MANUS_PILOT_OWNER_ID` as well as a feature flag and migrated database. Providing only the key does not enable live calls: this is required for protecting potentially billable execution.
- Dispatch runs inside a route only while a request is held; provider execution continues asynchronously, and subsequent events are handled through webhook or user polling. Uncertain dispatch and provider outputs needing human attention do not auto-retry.
- No API-funded test has been executed as part of setup.
