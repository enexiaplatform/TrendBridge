import { publicRun } from "@/lib/research/report";
import { apiError, researchContext, ResearchError } from "@/lib/research/server";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  try { const {id}=await params; const context=await researchContext(); const run=await context.get(id); if(!run) throw new ResearchError(404,"Research not found."); return Response.json({...publicRun(run),testUnlock:context.testUnlock},{headers:{"Cache-Control":"private, no-store"}}); } catch(error) { return apiError(error); }
}
