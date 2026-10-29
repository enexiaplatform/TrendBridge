import { ZodError } from "zod";
import { applyWorkspace, mutationSchema } from "@/lib/launch/model";
import { publicRun } from "@/lib/research/report";
import { nextUpdatedAt } from "@/lib/research/scenarios";
import { apiError, researchContext, requireSameOrigin, ResearchError } from "@/lib/research/server";
export const runtime="nodejs";
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    requireSameOrigin(request);
    const raw=await request.text();if(raw.length>180000)throw new ResearchError(413,"Workspace is too large.");
    let json:unknown;try{json=JSON.parse(raw);}catch{throw new ResearchError(400,"Invalid workspace data.");}
    const data=mutationSchema.parse(json),context=await researchContext(),{id}=await params,run=await context.get(id);
    if(!run)throw new ResearchError(404,"Research not found.");
    if(run.updatedAt!==data.expectedUpdatedAt)throw new ResearchError(409,"This case changed in another window. Reload before saving. Your draft is still here.");
    const now=nextUpdatedAt(run.updatedAt);
    run.workspace=applyWorkspace(run.workspace,data,now);run.updatedAt=now;
    await context.save(run,data.expectedUpdatedAt);
    return Response.json(publicRun(run),{headers:{"Cache-Control":"private, no-store"}});
  }catch(e){
    if(e instanceof ZodError)return Response.json({error:e.issues[0]?.message??"Check workspace values."},{status:400});
    if(e instanceof Error&&["MISSING_EVIDENCE","DECISION_LIMIT"].includes(e.message))return Response.json({error:e.message==="MISSING_EVIDENCE"?"Select evidence that still exists.":"Decision history limit reached."},{status:400});
    return apiError(e);
  }
}
