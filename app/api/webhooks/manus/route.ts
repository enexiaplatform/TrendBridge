import {apiError,ResearchError} from "@/lib/research/server";
import {reconcileByTaskId,pilotConfig} from "@/lib/research/manus-pilot";
import {manusPublicKey,verifySignature} from "@/lib/research/manus-webhook";
export const runtime="nodejs";
export async function POST(request:Request) {
  try {
    const config=pilotConfig();
    if(!config.flag || !config.key || !config.storage || !config.owner)
      throw new ResearchError(503,"Manus pilot is not enabled.");
    const canonical=process.env.MANUS_WEBHOOK_URL;
    if(!canonical)throw new ResearchError(503,"Webhook URL is not configured.");
    if(Number(request.headers.get("content-length")||0)>65_536)throw new ResearchError(413,"Webhook too large.");
    const raw=await request.text();if(raw.length>65_536)throw new ResearchError(413,"Webhook too large.");
    const timestamp=request.headers.get("x-webhook-timestamp")||"";
    const signature=request.headers.get("x-webhook-signature")||"";
    const publicKey=await manusPublicKey();
    if(!verifySignature(publicKey,canonical,raw,timestamp,signature))
      throw new ResearchError(401,"Invalid Manus webhook signature.");
    let payload:unknown;try{payload=JSON.parse(raw);}catch{throw new ResearchError(400,"Invalid webhook payload.");}
    const event=payload as {event_type?:string;task_detail?:{task_id?:string}};
    if(event.event_type==="task_stopped" && typeof event.task_detail?.task_id==="string"){
      // Always re-fetch through our own API key; never publish webhook-supplied claims.
      try{await reconcileByTaskId(event.task_detail.task_id);}catch{ return Response.json({ok:false,retry:true},{status:503}); }
    }
    return Response.json({ok:true});
  }catch(error){return apiError(error);}
}
