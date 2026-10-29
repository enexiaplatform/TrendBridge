import { launchHtml, launchWorkbook } from "@/lib/launch/exports";
import { apiError, researchContext, ResearchError } from "@/lib/research/server";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params,context=await researchContext(),run=await context.get(id);
    if(!run)throw new ResearchError(404,"Research not found.");
    const format=new URL(request.url).searchParams.get("format"),headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
    if(format==="html")return new Response(launchHtml(run),{headers:{...headers,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"}});
    if(format==="xlsx")return new Response(new Uint8Array(await launchWorkbook(run)),{headers:{...headers,"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="trendbridge-launch-${id}.xlsx"`}});
    throw new ResearchError(400,"Unsupported export format.");
  }catch(e){return apiError(e);}
}
