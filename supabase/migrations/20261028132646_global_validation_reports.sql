-- Global report envelope is intentionally separate from the original demo schema.
-- Both preview and full data remain private to the server; APIs project entitlements.
create table public.validation_runs (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_key text not null,
  document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,request_key),
  check(document->>'ownerId'=owner_id::text),
  check(document->>'id'=id::text)
);
create index validation_runs_owner_created on public.validation_runs(owner_id,created_at desc);
alter table public.validation_runs enable row level security;
revoke all on public.validation_runs from public,anon,authenticated;
grant select,insert,update,delete on public.validation_runs to service_role;

-- SECURITY INVOKER; service-only grant. Lock each owner to serialize rate checks/retries.
create function public.create_validation_run(p_id uuid,p_owner uuid,p_key text,p_document jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
  select document into existing from public.validation_runs where owner_id=p_owner and request_key=p_key;
  if found then return existing; end if;
  if (select count(*) from public.validation_runs where owner_id=p_owner and created_at>now()-interval '1 hour')>=10 then raise exception 'RATE_LIMIT'; end if;
  insert into public.validation_runs(id,owner_id,request_key,document) values(p_id,p_owner,p_key,p_document);
  return p_document;
end $$;
revoke all on function public.create_validation_run(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_validation_run(uuid,uuid,text,jsonb) to service_role;

-- Financial/evidence authority must not be client-writable even by its owner.
revoke insert,update,delete on public.research_jobs,public.reports,public.report_versions,public.sources,public.evidence_records,public.claims,public.claim_evidence,public.competitor_listings,public.suppliers,public.supplier_quotations,public.orders from authenticated;
revoke insert,update on public.profiles from authenticated;
grant insert(id,display_name,locale) on public.profiles to authenticated;
grant update(display_name,locale) on public.profiles to authenticated;
-- Existing owned SELECT policies remain; roles, prices and entitlements are server-owned.
