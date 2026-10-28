import { reportHtml, reportWorkbook } from "@/lib/research/exports";
import { apiError, researchContext, ResearchError } from "@/lib/research/server";
import { sampleRun } from "@/lib/research/sample";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  try { const {id}=await params;const run=id==="sample"?sampleRun():await (await researchContext()).get(id);if(!run)throw new ResearchError(404,"Research not found.");if(run.entitlement==="preview")throw new ResearchError(403,"Unlock this report to export it.");
    const format=new URL(request.url).searchParams.get("format");
    if(format==="html")return new Response(reportHtml(run),{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff"}});
    if(format==="rfq"){
      const text=["TrendBridge — Supplier Inquiry Kit",run.provider==="fixture"?"TEST TEMPLATE — no supplier contact or verification performed.":"Draft for your review. Not sent.","",`Product: ${run.input.name}`,`Configuration: ${run.input.configuration||"Please clarify specifications before requesting a quote."}`,`Target market: ${run.input.market}`,"","ENGLISH RFQ","Please quote this exact configuration at your available quantity tiers. Specify unit price/currency, MOQ, sample cost, lead time, packaging, incoterms, payment terms, OEM/ODM options and available supporting test documents.","Please distinguish listing claims from documents available for this exact product. Do not substitute a different configuration without explaining the differences.","Quantity tiers: [enter requested quantities]","Required documents: [confirm market and product requirements]","","中文询价模板",`产品：${run.input.name}`,`规格：${run.input.configuration||"请先确认产品规格。"}`,"请按不同采购数量提供报价，并注明单价和币种、最小起订量、样品费用、交货时间、包装、贸易术语、付款条件、OEM/ODM选项以及可提供的检测文件。","请确认文件是否适用于本款产品。如需更换规格，请明确说明差异。","采购数量：[填写数量]","所需文件：[确认目标市场和产品要求]","","Review this template before contacting any supplier. TrendBridge has not sent it."].join("\n");
      return new Response(text,{headers:{"Content-Type":"text/plain; charset=utf-8","Content-Disposition":`attachment; filename="trendbridge-rfq-${id}.txt"`,"Cache-Control":"private, no-store"}});
    }
    if(format!=="xlsx")throw new ResearchError(400,"Unsupported export format.");
    const bytes=await reportWorkbook(run);return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="trendbridge-${id}.xlsx"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch(error){return apiError(error);}
}
