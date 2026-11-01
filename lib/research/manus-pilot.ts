import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ManusAdapter } from "./manus";
import { validateResearch } from "./contract";
import type { ResearchInput } from "./contract";
import { ResearchError } from "./server";
import { matchesPilotOwner } from "./pilot-identity";

export type PilotStatus = "queued" | "dispatching" | "running" | "waiting" | "qa_pending" | "needs_review" | "failed" | "cancelled";
export type PilotJob = {
  id: string; run_id: string; owner_id: string; task_id: string | null;
  status: PilotStatus; attempts: number; lease_until: string | null;
  last_checked_at: string | null; credit_usage: number | null; report: unknown;
  quality_issues: {code:string;detail:string}[]; error_code: string | null;
  created_at: string; updated_at: string;
};
const active = ["queued", "dispatching", "running", "waiting"] as const;
const terminal = ["qa_pending", "needs_review", "failed", "cancelled"] as const;
export const pilotConfig = () => ({
  flag: process.env.MANUS_LIVE_ENABLED === "true",
  key: Boolean(process.env.MANUS_API_KEY?.trim()),
  owner: Boolean(process.env.MANUS_PILOT_OWNER_ID?.trim()),
  storage: process.env.SUPABASE_RESEARCH_SCHEMA === "trendbridge" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
});
export function pilotEnabled(ownerId?: string, ownerEmailVerified?: string | null) {
  const config = pilotConfig();
  return Object.values(config).every(Boolean) &&
    Boolean(ownerId && matchesPilotOwner(ownerId, ownerEmailVerified, process.env.MANUS_PILOT_OWNER_ID));
}
export function requirePilot(ownerId: string, ownerEmailVerified?: string | null) {
  if (!pilotEnabled(ownerId, ownerEmailVerified))
    throw new ResearchError(403,"Sign in with the confirmed private pilot owner account, and verify pilot configuration.");
}
/** Internal-only methods operate on service-owned jobs already created by an authorized user.
 * Signed webhooks do not have an end-user session, so they cannot re-check email.
 */
function requirePilotRuntime() {
  if (!Object.values(pilotConfig()).every(Boolean))
    throw new ResearchError(503,"The Manus pilot is not configured or enabled.");
}
export function pilotDb() {
  const config = pilotConfig();
  if (!config.storage) throw new ResearchError(503,"Pilot storage is not configured.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{
    auth:{persistSession:false,autoRefreshToken:false},
  }).schema("trendbridge");
}
function adapter() {
  if (!process.env.MANUS_API_KEY) throw new ResearchError(503,"Manus credentials are not configured.");
  return new ManusAdapter(process.env.MANUS_API_KEY,true);
}
function cleanJob(job: PilotJob | null) {
  if (!job) return null;
  return {id:job.id,status:job.status,createdAt:job.created_at,updatedAt:job.updated_at,
    lastCheckedAt:job.last_checked_at,credits:job.credit_usage,qualityIssues:job.quality_issues,
    errorCode:job.error_code,taskCreated:Boolean(job.task_id)};
}
export {cleanJob};
export async function findPilotByRun(ownerId:string,runId:string): Promise<PilotJob|null> {
  const {data,error}=await pilotDb().from("manus_jobs").select("*").eq("owner_id",ownerId).eq("run_id",runId).maybeSingle();
  if(error) throw new ResearchError(503,"Pilot queue is unavailable.");
  return data as PilotJob|null;
}
async function findByTaskId(taskId:string): Promise<PilotJob|null> {
  const {data,error}=await pilotDb().from("manus_jobs").select("*").eq("task_id",taskId).maybeSingle();
  if(error) throw new ResearchError(503,"Pilot queue is unavailable.");
  return data as PilotJob|null;
}
async function updateJob(job:PilotJob,patch:Record<string,unknown>): Promise<PilotJob> {
  const {data,error}=await pilotDb().from("manus_jobs").update({...patch,updated_at:new Date().toISOString()})
    .eq("id",job.id).eq("status",job.status).eq("updated_at",job.updated_at).select("*").maybeSingle();
  if(error) throw new ResearchError(503,"Pilot queue write failed.");
  if(!data) throw new ResearchError(409,"Research job was updated concurrently.");
  return data as PilotJob;
}
export async function enqueuePilot(ownerId:string,runId:string,ownerEmailVerified?:string|null) {
  requirePilot(ownerId,ownerEmailVerified);
  const {data,error}=await pilotDb().rpc("enqueue_manus_job",{p_run:runId,p_owner:ownerId});
  if(error) {
    if(error.message.includes("MANUS_DAILY_LIMIT"))throw new ResearchError(429,"Pilot limit: one Manus task per 24 hours.");
    if(error.message.includes("MANUS_BUSY"))throw new ResearchError(409,"A Manus pilot is already active.");
    if(error.message.includes("RUN_NOT_FOUND"))throw new ResearchError(404,"Research record not found.");
    throw new ResearchError(503,"Pilot queue is not available.");
  }
  return data as PilotJob;
}
export async function dispatchPilot(job:PilotJob,input:ResearchInput) {
  requirePilotRuntime();
  if (job.status !== "queued") return job;
  const {data,error}=await pilotDb().rpc("claim_manus_job",{p_job:job.id});
  if(error) throw new ResearchError(503,"Could not claim pilot job.");
  if(!data) return findPilotByRun(job.owner_id,job.run_id);
  const claimed=data as PilotJob;
  try {
    const response=await adapter().create(input);
    // An unsuccessful provider response must never mark a task as running.
    const id=(response as {task_id?:unknown}).task_id;
    if(typeof id!=="string" || !/^[A-Za-z0-9_-]{10,120}$/.test(id))
      throw new Error("MANUS_CREATE_UNCONFIRMED");
    return await updateJob(claimed,{status:"running",task_id:id,lease_until:null,error_code:null});
  } catch {
    // An API timeout can mean a paid task was created. Never auto-retry create.
    try {await updateJob(claimed,{status:"needs_review",error_code:"DISPATCH_UNCERTAIN",lease_until:null});}catch{}
    throw new ResearchError(502,"Task submission could not be confirmed. Manual reconciliation is required; no automatic retry will be sent.");
  }
}
export async function reconcilePilot(job:PilotJob) {
  requirePilotRuntime();
  if(!job.task_id || !["running","waiting"].includes(job.status)) return job;
  if(job.last_checked_at && Date.now()-Date.parse(job.last_checked_at)<60_000) return job;
  const provider=adapter();
  // task.detail reports credits and metadata, not lifecycle status. Status is in
  // task.listMessages -> status_update.agent_status.
  const detail=await provider.detail(job.task_id) as {task?:{credit_usage?:number}};
  const messages=await provider.messages(job.task_id) as {messages?:Array<{
    type?:string;status_update?:{agent_status?:string};
    structured_output_result?:{success?:boolean;value?:unknown;error?:string}
  }>;has_more?:boolean};
  const events=messages.messages ?? [];
  const status=events.find(m=>m.type==="status_update")?.status_update?.agent_status;
  const extracted=events.find(m=>m.type==="structured_output_result")?.structured_output_result;
  const base={last_checked_at:new Date().toISOString(),
    credit_usage:typeof detail.task?.credit_usage==="number"?detail.task.credit_usage:job.credit_usage};
  if(status==="waiting")return updateJob(job,{...base,status:"waiting",error_code:"USER_INPUT_REQUIRED"});
  if(status==="error")return updateJob(job,{...base,status:"failed",error_code:"PROVIDER_TASK_ERROR"});
  if(status==="running" || !status)return updateJob(job,{...base,status:"running",error_code:null});
  if(status!=="stopped")return updateJob(job,{...base,status:"needs_review",error_code:"UNKNOWN_PROVIDER_STATE"});
  // Manus may emit structured data after the stopped event. An absent result
  // cannot be published, and pagination gaps must remain a manual review.
  if(!extracted?.success) return updateJob(job,{...base,status:"needs_review",error_code:"NO_STRUCTURED_RESULT"});
  const validated=validateResearch(extracted.value);
  if(!validated.data)return updateJob(job,{...base,status:"needs_review",error_code:"SCHEMA_OR_EVIDENCE_FAILURE",quality_issues:validated.issues});
  return updateJob(job,{...base,status:"qa_pending",error_code:null,report:validated.data,quality_issues:[{
    code:"independent_review_required",detail:"Structural checks do not prove remote source accuracy."}]});
}
export async function reconcileByTaskId(taskId:string) {
  const job=await findByTaskId(taskId);
  if (!job) return null;
  return reconcilePilot(job);
}
export async function stopPilot(job:PilotJob) {
  requirePilotRuntime();
  if (!job.task_id || terminal.includes(job.status as (typeof terminal)[number]))
    return job;
  await adapter().stop(job.task_id);
  return updateJob(job,{status:"cancelled",error_code:null});
}
