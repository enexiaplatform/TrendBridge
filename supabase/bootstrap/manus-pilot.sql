-- Optional additive Manus pilot schema for the already inspected isolated TrendBridge database.
-- Apply only to the Supabase project containing trendbridge.validation_runs.
-- Never run this against the unrelated public-schema demo.
begin;

create table if not exists trendbridge.manus_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references trendbridge.validation_runs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  task_id text unique,
  status text not null default 'queued'
    check (status in ('queued','dispatching','running','waiting','qa_pending','needs_review','failed','cancelled')),
  attempts integer not null default 0 check (attempts between 0 and 1),
  lease_until timestamptz,
  last_checked_at timestamptz,
  credit_usage integer check (credit_usage is null or credit_usage >= 0),
  report jsonb,
  quality_issues jsonb not null default '[]'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists manus_jobs_active_idx on trendbridge.manus_jobs(status,updated_at);
create index if not exists manus_jobs_owner_idx on trendbridge.manus_jobs(owner_id,created_at desc);
alter table trendbridge.manus_jobs enable row level security;
revoke all on trendbridge.manus_jobs from public, anon, authenticated;
grant select, insert, update on trendbridge.manus_jobs to service_role;

-- A single pilot job in any rolling 24h period, and no concurrent running jobs.
-- The global advisory lock makes the caps safe against concurrent serverless requests.
create or replace function trendbridge.enqueue_manus_job(p_run uuid, p_owner uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare job trendbridge.manus_jobs%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('trendbridge-manus-pilot', 0));
  select * into job from trendbridge.manus_jobs where run_id=p_run and owner_id=p_owner;
  if found then return to_jsonb(job); end if;
  if not exists (select 1 from trendbridge.validation_runs where id=p_run and owner_id=p_owner)
    then raise exception 'RUN_NOT_FOUND'; end if;
  if exists (select 1 from trendbridge.manus_jobs where created_at > now()-interval '24 hours')
    then raise exception 'MANUS_DAILY_LIMIT'; end if;
  if exists (select 1 from trendbridge.manus_jobs where status in ('dispatching','running','waiting'))
    then raise exception 'MANUS_BUSY'; end if;
  insert into trendbridge.manus_jobs(run_id,owner_id) values (p_run,p_owner) returning * into job;
  return to_jsonb(job);
end $$;
revoke all on function trendbridge.enqueue_manus_job(uuid,uuid) from public,anon,authenticated;
grant execute on function trendbridge.enqueue_manus_job(uuid,uuid) to service_role;

-- Only a single dispatcher can claim a queued task; never automatically retry a
-- possibly charged request after an uncertain network failure.
create or replace function trendbridge.claim_manus_job(p_job uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare job trendbridge.manus_jobs%rowtype;
begin
  update trendbridge.manus_jobs
    set status='dispatching',attempts=1,lease_until=now()+interval '2 minutes',updated_at=now()
    where id=p_job and status='queued' and attempts=0
    returning * into job;
  if not found then return null; end if;
  return to_jsonb(job);
end $$;
revoke all on function trendbridge.claim_manus_job(uuid) from public,anon,authenticated;
grant execute on function trendbridge.claim_manus_job(uuid) to service_role;
commit;
