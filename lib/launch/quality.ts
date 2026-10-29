import type { Evidence } from "./model";
export type QualityFlag={id:string;code:"stale"|"quote_expired"|"scope_gap"|"unit_gap"|"duplicate_url";message:string};
export function collectionQuality(rows:Evidence[],now=new Date()){
  const flags:QualityFlag[]=[],seen=new Set<string>();
  for(const row of rows){
    const age=(now.getTime()-Date.parse(row.observedOn+"T00:00:00Z"))/86400000;
    if(age>30)flags.push({id:row.id,code:"stale",message:"Observation is more than 30 days old. Check whether it still applies."});
    if(row.kind==="supplier"&&row.quoteExpiresOn&&row.quoteExpiresOn<now.toISOString().slice(0,10))flags.push({id:row.id,code:"quote_expired",message:"Supplier quote has expired. Request confirmation before using it."});
    if((row.kind==="supplier"||row.kind==="competitor")&&!row.configuration.trim())flags.push({id:row.id,code:"scope_gap",message:"Exact configuration is missing; this is not a like-for-like comparison."});
    if(row.match==="comparable"&&row.price!==null&&!row.packSize)flags.push({id:row.id,code:"unit_gap",message:"Pack size is missing; per-unit price cannot be compared."});
    let url=row.url;try{const parsed=new URL(url);parsed.hash="";url=parsed.href;}catch{/* Draft URLs are validated when saving. */}
    if(seen.has(url)&&url)flags.push({id:row.id,code:"duplicate_url",message:"Another record uses this URL. It is not independent corroboration."});
    seen.add(url);
  }
  return flags;
}
