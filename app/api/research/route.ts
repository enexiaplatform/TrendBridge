import { researchInputSchema } from "@/lib/research/contract";
import { buildSnapshot, publicRun, type Run } from "@/lib/research/report";
import { apiError, researchContext, requireSameOrigin, ResearchError } from "@/lib/research/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (Number(request.headers.get("content-length") || 0) > 16_384) throw new ResearchError(413,"Input is too large.");
    const text = await request.text(); if(text.length > 16_384) throw new ResearchError(413,"Input is too large.");
    let raw: unknown; try { raw = JSON.parse(text); } catch { throw new ResearchError(400,"Invalid JSON input."); }
    const parsed = researchInputSchema.safeParse(raw);
    if(!parsed.success) return Response.json({error:"Check your product details.",details:parsed.error.flatten()},{status:400});
    const key = request.headers.get("idempotency-key");
    if(!key || !/^[a-zA-Z0-9-]{16,80}$/.test(key)) throw new ResearchError(400,"A valid idempotency key is required.");
    const context = await researchContext(true); const now = new Date().toISOString();
    const run: Run = {id:crypto.randomUUID(),ownerId:context.owner,createdAt:now,updatedAt:now,requestKey:key,status:"preview_ready",input:parsed.data,snapshot:buildSnapshot(parsed.data),provider:"disabled",entitlement:"preview",report:null};
    const saved = await context.create(run);
    return Response.json(publicRun(saved),{status:201,headers:{"Cache-Control":"private, no-store"}});
  } catch(error) { return apiError(error); }
}
export async function GET() {
  try { const context = await researchContext(); const runs = await context.list(); return Response.json({runs:runs.map(r=>({id:r.id,name:r.input.name,market:r.input.market,currency:r.input.currency,createdAt:r.createdAt,status:r.status,access:r.entitlement}))},{headers:{"Cache-Control":"private, no-store"}}); }
  catch(error) { return apiError(error); }
}
