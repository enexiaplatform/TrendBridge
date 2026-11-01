import { apiError, researchContext, requireSameOrigin, ResearchError } from "@/lib/research/server";
import { cleanJob, dispatchPilot, enqueuePilot, findPilotByRun, reconcilePilot, requirePilot } from "@/lib/research/manus-pilot";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params; const context=await researchContext(); requirePilot(context.owner);
    const run=await context.get(id); if(!run)throw new ResearchError(404,"Research not found.");
    const job=await findPilotByRun(context.owner,id);
    let current=job;
    if(job?.task_id && ["running","waiting"].includes(job.status)) {
      try {current=await reconcilePilot(job);}catch{current=job;}
    }
    return Response.json({job:cleanJob(current)},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiError(error);}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    requireSameOrigin(request); const {id}=await params;
    const context=await researchContext(); requirePilot(context.owner);
    const run=await context.get(id); if(!run)throw new ResearchError(404,"Research not found.");
    if(run.entitlement!=="preview") throw new ResearchError(409,"Research is already unlocked.");
    const job=await enqueuePilot(context.owner,id);
    const current=job.status==="queued"?await dispatchPilot(job,run.input):job;
    return Response.json({job:cleanJob(current)},{status:202,headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiError(error);}
}
