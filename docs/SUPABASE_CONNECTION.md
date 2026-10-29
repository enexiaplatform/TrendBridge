# Supabase connection checkpoint

## Existing project preflight

Inspect the selected project's name, tables, actual row counts, Auth users, migration ledger and role permissions before connecting. Legacy application users can be distinct from Supabase Auth users. Estimated table counts do not prove a project is empty. Record project-specific security findings privately, without retrieving user/session contents or publishing target identifiers in this repository.

If existing objects allow unintended public access, do not publish the project's key in TrendBridge or enable guest sign-in until the user selects either a separate project or permits compatibility-reviewed remediation. Do not enable blanket policies or revoke legacy permissions without first understanding the other application's access model. Production persistence has **not** been accepted at this checkpoint.

## Prepared isolated storage

`supabase/bootstrap/isolated-research.sql` is a standalone bootstrap, not an additional file in the existing public-schema migration chain. It creates only `trendbridge.validation_runs` and its service-only creation function, with explicit grants, RLS, owner/document checks, retry idempotency and ten creations per owner per hour. It deliberately fails if `trendbridge` already exists. It does not modify legacy tables, Auth settings or project-wide default grants.

The server supports `SUPABASE_RESEARCH_SCHEMA=trendbridge`; an absent value continues to use `public` for existing installations. Unknown schema values fail closed. The browser never accesses report documents directly. The server verifies the user's Auth session and supplies the owner predicate to every read/write; saves also compare the previous document timestamp. Service credentials bypass RLS, so these application ownership checks remain required.

## Execution sequence after the project decision

1. Recheck target identity, migration ledger, table catalog, actual row counts and permissions. For a shared project, inspect the existing application's connection path and prepare a scoped permission change with a restorable grants/policy snapshot. Take and rehearse an appropriate database backup before changing existing schema/security.
2. Run the isolated bootstrap against a local PostgreSQL-compatible test database with representative legacy objects. Apply its reviewed SQL once through the connected migration tool, preserving its actual migration ledger entry. Do not run the old TrendBridge public-schema migration chain against the shared project.
3. Add `trendbridge` to the Data API exposed schemas while preserving every existing exposed schema. Grant schema access only to `service_role`; do not copy the documentation's example broad client grants. Verify that browser roles cannot read documents or execute the creation function.
4. Configure the project's guest Auth only after the shared-project access gate is resolved. Configure public URL/publishable key and server-only secret/schema in the exact TrendBridge production project. Never print or commit credential values. Redeploy so public configuration is rebuilt.
5. Verify online: create a private snapshot, save workspace changes, reload, list/history, export, stale-write rejection, and a second browser session unable to read or write the first session's case. Check direct browser-role Data API denial, final deployment readiness and logs. Repeat security advisors and distinguish existing findings from introduced ones.

## Rollback and limits

Before live use, rollback means restoring prior deployment/environment configuration and removing only the unused isolated objects after confirming their contents. Once cases exist, export/backup and preserve those records; do not drop the schema to fix a configuration error. Restore any changed legacy grants/policies from the reviewed snapshot if compatibility fails.

The isolated bootstrap passed a local PGlite rehearsal with a representative legacy table: preservation of legacy data/grants, client-role denial, service-only creation, document identity checks, idempotent retries including after quota exhaustion, owner predicates, and stale-write rejection. This is not proof of live Data API/Auth connectivity. Manus research, payments and scheduled refresh remain disabled. This does not implement team collaboration or indefinite audit retention.

References: [Data API security](https://supabase.com/docs/guides/api/securing-your-api), [custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas), [anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous).
