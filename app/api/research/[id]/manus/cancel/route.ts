import {apiError,researchContext,requireSameOrigin,ResearchError} from "@/lib/research/server";
import {cleanJob,findPilotByRun,requirePilot,stopPilot} from "@/lib/research/manus-pilot";
export const runtime="nodejs";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    requireSameOrigin(request); const {id}=await params;const context=await researchContext(); requirePilot(context.owner, context.ownerEmailVerified);
    if(!await context.get(id))throw new ResearchError(404,"Research not found.");
    const job=await findPilotByRun(context.owner,id);if(!job)throw new ResearchError(404,"Pilot not found.");
    return Response.json({job:cleanJob(await stopPilot(job))},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiError(error);}
}
