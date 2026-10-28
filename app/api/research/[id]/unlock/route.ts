import { buildFixture, publicRun } from "@/lib/research/report";
import { validateResearch } from "@/lib/research/contract";
import { nextUpdatedAt } from "@/lib/research/scenarios";
import { apiError, researchContext, requireSameOrigin, ResearchError } from "@/lib/research/server";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    requireSameOrigin(request); const {id}=await params; const context=await researchContext(); const run=await context.get(id);
    if(!run) throw new ResearchError(404,"Research not found.");
    if(run.entitlement === "paid" || run.entitlement === "fixture") return Response.json(publicRun(run));
    if(!context.testUnlock || process.env.NODE_ENV === "production") throw new ResearchError(503,"Full reports are not on sale yet. Manus research and verified payment fulfillment are awaiting activation.");
    const result=validateResearch(buildFixture(run.input));
    if(!result.data) throw new ResearchError(422,"Report did not pass validation. No payment or credit was consumed.");
    const previous=run.updatedAt;
    run.report=result.data; run.entitlement="fixture"; run.provider="fixture"; run.status="partial"; run.updatedAt=nextUpdatedAt(previous); await context.save(run,previous);
    return Response.json(publicRun(run),{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) { return apiError(error); }
}
