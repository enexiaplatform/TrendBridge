import { apiError,researchContext } from "@/lib/research/server";
export async function GET(){
  try{
    const runs=await(await researchContext()).list();
    const records=runs.flatMap(r=>(r.workspace?.evidence??[]).map(e=>({id:e.id,caseId:r.id,caseName:r.input.name,market:r.input.market,channel:r.input.channel,kind:e.kind,title:e.title,url:e.url,observedOn:e.observedOn,price:e.price,currency:e.currency,packSize:e.packSize,configuration:e.configuration,match:e.match}))).sort((a,b)=>b.observedOn.localeCompare(a.observedOn));
    return Response.json({records:records.slice(0,500),total:records.length,caseLimit:100,recordLimit:500,coverage:"user-supplied records in your latest private cases; not a market-wide dataset"},{headers:{"Cache-Control":"private, no-store"}});
  }catch(e){return apiError(e);}
}
