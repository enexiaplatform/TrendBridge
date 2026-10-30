import { z } from "zod";

const id=z.uuid(), short=z.string().trim().max(120), prose=z.string().trim().max(800);
const amount=z.number().finite().min(0).max(1e10).nullable();
const rating=z.number().int().min(1).max(5).nullable();
const links=z.array(id).max(30);
export const segmentSchema=z.object({id,name:short,profile:prose,problem:prose,trigger:prose,alternatives:prose,customers:amount,annualSpend:amount,urgency:rating,accessibility:rating,sourceIds:links}).strict();
export const competitorSchema=z.object({id,name:short,kind:z.enum(["direct","indirect","alternative"]),configuration:prose,price:amount,jobFit:rating,strengths:prose,gaps:prose,sourceIds:links}).strict();
export const channelSchema=z.object({id,name:short,segmentId:id.nullable(),budget:amount,cpc:z.number().finite().positive().max(1e8).nullable(),leadRate:z.number().min(0).max(1).nullable(),winRate:z.number().min(0).max(1).nullable(),revenuePerCustomer:amount,contributionPerCustomer:z.number().finite().min(-1e10).max(1e10).nullable(),hypothesis:prose,sourceIds:links}).strict().superRefine((v,c)=>{if(v.contributionPerCustomer!==null&&v.revenuePerCustomer!==null&&v.contributionPerCustomer>v.revenuePerCustomer)c.addIssue({code:"custom",message:"Pre-acquisition contribution cannot exceed revenue per customer."});});
export const playSchema=z.object({id,title:short,phase:z.enum(["discover","validate","launch","scale"]),startWeek:z.number().int().min(1).max(13),endWeek:z.number().int().min(1).max(13),owner:short,channelId:id.nullable(),gate:prose,status:z.enum(["planned","running","done"])}).strict();
export const strategySchema=z.object({
  schemaVersion:z.literal("trendbridge.strategy/v1"),marketDefinition:prose,horizon:short.default(""),
  segments:z.array(segmentSchema).max(8),competitors:z.array(competitorSchema).max(12),
  signal:z.object({metric:short,unit:short,definition:prose,points:z.array(z.object({month:z.string().regex(/^(19|20)\d{2}-(0[1-9]|1[0-2])$/).refine(v=>v<=new Date(Date.now()+14*3600000).toISOString().slice(0,7),"Observations cannot be future months."),value:amount,sourceIds:links}).strict()).max(12)}).strict(),
  positioning:z.object({segmentId:id.nullable(),category:prose,promise:prose,difference:prose,proof:prose,objection:prose,offer:prose}).strict(),
  channels:z.array(channelSchema).max(8),plays:z.array(playSchema).max(12),
}).strict().superRefine((s,c)=>{
  for(const rows of [s.segments,s.competitors,s.channels,s.plays]) if(new Set(rows.map(r=>r.id)).size!==rows.length)c.addIssue({code:"custom",message:"Strategy record IDs must be unique."});
  if(new Set(s.signal.points.map(p=>p.month)).size!==s.signal.points.length)c.addIssue({code:"custom",message:"Only one signal observation per month is allowed."});
  const segments=new Set(s.segments.map(r=>r.id)),channels=new Set(s.channels.map(r=>r.id));
  if(s.positioning.segmentId&&!segments.has(s.positioning.segmentId))c.addIssue({code:"custom",message:"Positioning refers to a missing segment."});
  for(const r of s.channels)if(r.segmentId&&!segments.has(r.segmentId))c.addIssue({code:"custom",message:"Channel refers to a missing segment."});
  for(const r of s.plays){if(r.channelId&&!channels.has(r.channelId))c.addIssue({code:"custom",message:"Launch play refers to a missing channel."});if(r.endWeek<r.startWeek)c.addIssue({code:"custom",message:"A launch play must end on or after its start week."});}
});
export type Strategy=z.infer<typeof strategySchema>;
export type Segment=z.infer<typeof segmentSchema>;
export type Competitor=z.infer<typeof competitorSchema>;
export type Channel=z.infer<typeof channelSchema>;
export type Play=z.infer<typeof playSchema>;
export function emptyStrategy():Strategy{return {schemaVersion:"trendbridge.strategy/v1",marketDefinition:"",horizon:"",segments:[],competitors:[],signal:{metric:"",unit:"",definition:"",points:[]},positioning:{segmentId:null,category:"",promise:"",difference:"",proof:"",objection:"",offer:""},channels:[],plays:[]};}
export function strategySources(s:Strategy){return [...s.segments,...s.competitors,...s.channels,...s.signal.points].flatMap(r=>r.sourceIds);}
// Decimal inputs are planning assumptions. Exact rational floors avoid turning
// 0.3 / 0.1 into two visits, or 1,000 × 0.08 × 0.7 into 55 leads.
function fraction(value:number):[bigint,bigint]{const [coefficient,exponent="0"]=value.toString().toLowerCase().split("e"),scale=(coefficient.split(".")[1]?.length??0)-Number(exponent);return [BigInt(coefficient.replace(".",""))*BigInt(10)**BigInt(Math.max(0,-scale)),BigInt(10)**BigInt(Math.max(0,scale))];}
function cohort(count:number,rate:number,multiplier:number){const [a,b]=fraction(rate),[c,d]=fraction(multiplier),n=a*c,denominator=b*d;return Number(BigInt(count)*(n>denominator?denominator:n)/denominator);}
export function channelForecast(channel:Channel,multiplier=1){
  if(!channelSchema.safeParse(channel).success||!Number.isFinite(multiplier)||multiplier<0||multiplier>2)return {status:"invalid" as const,visits:null,leads:null,customers:null,cac:null,revenue:null,contribution:null};
  const {budget,cpc,leadRate,winRate,revenuePerCustomer,contributionPerCustomer}=channel;
  if(budget===null||cpc===null||leadRate===null||winRate===null)return {status:"incomplete" as const,visits:null,leads:null,customers:null,cac:null,revenue:null,contribution:null};
  const [bn,bd]=fraction(budget),[cn,cd]=fraction(cpc),rawVisits=bn*cd/(bd*cn);
  if(rawVisits>BigInt(Number.MAX_SAFE_INTEGER))return {status:"invalid" as const,visits:null,leads:null,customers:null,cac:null,revenue:null,contribution:null};
  const visits=Number(rawVisits),leads=cohort(visits,leadRate,multiplier),customers=cohort(leads,winRate,multiplier);
  if(customers*Math.max(revenuePerCustomer??0,Math.abs(contributionPerCustomer??0))>Number.MAX_SAFE_INTEGER/100)return {status:"invalid" as const,visits:null,leads:null,customers:null,cac:null,revenue:null,contribution:null};
  return {status:"modeled" as const,visits,leads,customers,cac:customers===0?null:budget/customers,revenue:revenuePerCustomer===null?null:customers*revenuePerCustomer,contribution:contributionPerCustomer===null?null:customers*contributionPerCustomer-budget};
}
export function monthlySignal(s:Strategy["signal"]){
  if(s.points.some(p=>!/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(p.month)||(p.value!==null&&(!Number.isFinite(p.value)||p.value<0||p.value>1e10))))return null;
  const sorted=[...s.points].sort((a,b)=>a.month.localeCompare(b.month));
  if(!sorted.length)return [];
  const [year,month]=sorted[0].month.split("-").map(Number), [lastYear,lastMonth]=sorted[sorted.length-1].month.split("-").map(Number);
  const count=(lastYear-year)*12+lastMonth-month+1;
  // Avoid unbounded geometry from sparse user dates; the input still remains in its table.
  if(count>36)return null;
  return Array.from({length:count},(_,i)=>{const date=new Date(Date.UTC(year,month-1+i,1)),key=date.toISOString().slice(0,7);return sorted.find(p=>p.month===key)??{month:key,value:null,sourceIds:[]};});
}
