# TrendBridge AI

Production-oriented MVP foundation for an evidence-backed product intelligence and launch platform.

## What works locally

- Vietnamese-first public website and pricing
- Supabase email/password auth adapter (active when configured)
- Five-step product research wizard
- Persisted project and job creation when authenticated against Supabase
- Deterministic financial engine with the canonical fixture tests
- Interactive report with sensitivity analysis and editable assumptions
- Honest unavailable states for competitor, supplier and market-signal providers
- Client-generated summary PDF for the development report
- Configurable plan/credit/payment data model with an idempotent credit ledger function
- Owner-scoped RLS policies and a pgTAP schema/security smoke test
- Admin provider readiness view
- Commercial design system with reusable UI primitives and a live `/design-system` catalogue

## Run

```bash
npm install
copy .env.example .env.local
npm run dev
```

The UI is useful without credentials in clearly labeled development mode. To activate persistence and real accounts, configure the Supabase public URL and publishable key, then apply the migration.

## Supabase

The migration under `supabase/migrations` creates normalized product research, evidence, sourcing, financial and commerce domains. Every user-data table has RLS enabled, explicit grants and owner policies. New Supabase projects no longer expose public tables automatically, so the migration grants only the operations needed by each role.

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

No production database is changed by this repository until you explicitly link a project and push the migration.

## Design system

The visual and interaction system is documented in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md). Its live catalogue runs at `/design-system`. Reusable primitives live under `components/ui`, while typed tokens live in `lib/design-system.ts`.

## External providers

Search, AI and payment providers default to `disabled`. The application never substitutes fixtures for real provider results. Add a provider behind the adapter boundary and keep retrieved content untrusted. Payment fulfillment must verify the provider webhook, lookup the authoritative order and amount server-side, and call the private credit-ledger function with a stable idempotency key.

## Readiness boundary

This is a functional MVP codebase, not a production launch receipt. Merchant onboarding, licensed research API contracts, worker deployment, transactional email, legal review, Supabase project configuration and live end-to-end verification remain external prerequisites.
