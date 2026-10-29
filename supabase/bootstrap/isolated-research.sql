-- Standalone bootstrap for an inspected existing project, NOT a continuation of
-- the public-schema migration chain. Apply once through apply_migration after
-- project/security preflight. Deliberately fail if this schema already exists.
-- This file does not change any public tables, global defaults or Auth settings.
begin;

create schema trendbridge;
revoke all on schema trendbridge from public, anon, authenticated;
grant usage on schema trendbridge to service_role;

create table trendbridge.validation_runs (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_key text not null,
  document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, request_key),
  check ((document->>'ownerId') is not null and document->>'ownerId'=owner_id::text),
  check ((document->>'id') is not null and document->>'id'=id::text)
);
create index validation_runs_owner_created on trendbridge.validation_runs(owner_id, created_at desc);
alter table trendbridge.validation_runs enable row level security;
revoke all on trendbridge.validation_runs from public, anon, authenticated;
grant select, insert, update, delete on trendbridge.validation_runs to service_role;

create function trendbridge.create_validation_run(p_id uuid, p_owner uuid, p_key text, p_document jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_owner::text, 0));
  select document into existing from trendbridge.validation_runs
    where owner_id=p_owner and request_key=p_key;
  if found then return existing; end if;
  if (select count(*) from trendbridge.validation_runs
      where owner_id=p_owner and created_at>now()-interval '1 hour')>=10
    then raise exception 'RATE_LIMIT'; end if;
  insert into trendbridge.validation_runs(id, owner_id, request_key, document)
    values(p_id, p_owner, p_key, p_document);
  return p_document;
end $$;
revoke all on function trendbridge.create_validation_run(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function trendbridge.create_validation_run(uuid, uuid, text, jsonb) to service_role;

commit;
