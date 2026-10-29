import { forecast } from "@/lib/launch/model";
import { apiError,researchContext } from "@/lib/research/server";
export async function GET(){
  try{
    const context=await researchContext(),runs=await context.list();
    return Response.json({limit:100,opportunities:runs.map(r=>({id:r.id,name:r.input.name,market:r.input.market,channel:r.input.channel,currency:r.input.currency,configuration:r.input.configuration,createdAt:r.createdAt,updatedAt:r.updatedAt,project:r.workspace?.project??"",stage:r.workspace?.stage??"exploring",archived:r.workspace?.archived??false,financials:r.snapshot.financials,unknowns:r.snapshot.unknowns,evidenceCount:r.workspace?.evidence.length??0,nextTest:r.workspace?.experiments.find(e=>e.status==="planned"||e.status==="running")?.title??null,decision:r.workspace?.decisions.at(-1)??null,cash:r.workspace?(()=>{const f=forecast(r.workspace.cash,r.input.currency);return {status:f.status,gap:f.status==="ready"?f.fundingGap:null};})():{status:"incomplete",gap:null}}))},{headers:{"Cache-Control":"private, no-store"}});
  }catch(e){return apiError(e);}
}
