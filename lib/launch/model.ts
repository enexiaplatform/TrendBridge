import { z } from "zod";
import { currencies } from "@/lib/global";

const text = z.string().trim().max(3000);
const id = z.uuid();
const amount = z.number().finite().min(0).max(1e10).nullable();
const units = z.number().int().min(0).max(1e7).nullable();
export const stages = ["exploring", "researching", "validating", "decision", "paused", "rejected", "launched"] as const;
export const blockKeys = ["summary", "customer", "market", "competition", "positioning", "channels", "operations", "financials", "risks", "milestones"] as const;
export const evidenceSchema = z.object({
  id, kind: z.enum(["market", "competitor", "customer", "supplier"]), title: z.string().trim().min(2).max(160),
  url: z.url().refine(v => new URL(v).protocol === "https:"), excerpt: z.string().trim().min(5).max(3000),
  observedOn: z.iso.date().refine(v=>v<=new Date(Date.now()+14*3600000).toISOString().slice(0,10),"Observation cannot be in the future."), configuration: z.string().trim().max(500), limitations: text,
  price: amount, currency: z.enum(currencies), packSize: z.number().int().min(1).max(100000).nullable(),
  match: z.enum(["comparable", "partial", "excluded", "not_applicable"]),
  moq:units.optional(),incoterm:z.string().max(40).optional(),leadDays:units.optional(),quoteExpiresOn:z.union([z.literal(""),z.iso.date()]).optional(),paymentTerms:z.string().max(500).optional(),
}).strict();
export const experimentSchema = z.object({
  id, title: z.string().trim().min(2).max(160), hypothesis: text, method: text, owner: z.string().max(120),
  dueOn: z.union([z.literal(""), z.iso.date()]), budgetCap: amount, spent: amount,
  passCondition: text, stopCondition: text, status: z.enum(["planned", "running", "passed", "failed", "stopped"]), result: text,
  evidenceIds: z.array(id).max(30),
}).strict().superRefine((v, c) => {
  if (["passed", "failed", "stopped"].includes(v.status) && (!v.result || !v.passCondition || !v.stopCondition)) c.addIssue({code:"custom",message:"Record result and pass/stop conditions before closing a test."});
  if (v.status === "running" && (v.budgetCap === null || !v.passCondition || !v.stopCondition)) c.addIssue({code:"custom",message:"Set budget cap and pass/stop conditions before starting."});
  if (v.status === "passed" && v.budgetCap !== null && v.spent !== null && v.spent > v.budgetCap) c.addIssue({code:"custom",message:"An over-budget test cannot be marked passed. Record a stopped or failed result."});
  if(v.status==="passed"&&(v.spent===null||v.budgetCap===null))c.addIssue({code:"custom",message:"Record actual spend and the budget cap before marking passed."});
});
export const cashInputSchema = z.object({
  openingCash: amount, openingStock: units, price: amount, unitCost: amount, logistics: amount, packaging: amount, acquisition: amount,
  feeRate: z.number().min(0).max(.99).nullable(), refundRate: z.number().min(0).max(1).nullable(),
  leadMonths: z.number().int().min(0).max(3), payoutMonths: z.number().int().min(0).max(3), depositRate: z.number().min(0).max(1),
  startupCosts: amount,
  months: z.array(z.object({orders:units,sales:units,fixedCosts:amount}).strict()).length(12),
}).strict();
const planBlock = z.object({key:z.enum(blockKeys), content:text, evidenceIds:z.array(id).max(30), reviewedAt:z.iso.datetime().nullable(), basis:z.string().max(100000)}).strict();
export const workspaceSchema = z.object({
  schemaVersion:z.literal("trendbridge.workspace/v1"), project:z.string().trim().max(100), stage:z.enum(stages), archived:z.boolean(),
  evidence:z.array(evidenceSchema).max(30), experiments:z.array(experimentSchema).max(20), cash:cashInputSchema,
  cashScenarios:z.array(z.object({id,name:z.string().trim().min(2).max(80),cash:cashInputSchema}).strict()).max(3).default([]),
  sizing:z.object({customers:amount,annualSpend:amount,serviceableRate:z.number().min(0).max(1).nullable(),reachableCustomers:amount,sourceIds:z.array(id).max(30)}).strict().default({customers:null,annualSpend:null,serviceableRate:null,reachableCustomers:null,sourceIds:[]}),
  blocks:z.array(planBlock).length(10),
}).strict().superRefine((w,c)=>{
  if(new Set(w.blocks.map(b=>b.key)).size!==10)c.addIssue({code:"custom",message:"Plan sections must be unique."});
  for(const rows of [w.evidence,w.experiments]) if(new Set(rows.map(r=>r.id)).size!==rows.length)c.addIssue({code:"custom",message:"Duplicate record IDs."});
  const sources=new Set(w.evidence.map(e=>e.id));
  for(const row of [...w.experiments,...w.blocks])if(row.evidenceIds.some(e=>!sources.has(e)))c.addIssue({code:"custom",message:"A linked evidence record is missing."});
  if(w.sizing.sourceIds.some(id=>!sources.has(id)))c.addIssue({code:"custom",message:"Sizing source is missing."});
});
export type Workspace = z.infer<typeof workspaceSchema>;
export type CashInput = z.infer<typeof cashInputSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type Decision = {id:string;at:string;choice:"continue"|"revise"|"stop";rationale:string;evidenceIds:string[];evidenceSnapshot:Evidence[]};
export type PlanVersion = {revision:number;at:string;blocks:Workspace["blocks"];cash:CashInput;sizing:Workspace["sizing"]};
export type SavedWorkspace = Workspace & {revision:number;decisions:Decision[];planVersions:PlanVersion[]};
export function emptyWorkspace(): SavedWorkspace {
  return {schemaVersion:"trendbridge.workspace/v1",project:"",stage:"exploring",archived:false,evidence:[],experiments:[],cashScenarios:[],sizing:{customers:null,annualSpend:null,serviceableRate:null,reachableCustomers:null,sourceIds:[]},revision:0,decisions:[],planVersions:[],
    cash:{openingCash:null,openingStock:null,price:null,unitCost:null,logistics:null,packaging:null,acquisition:null,feeRate:null,refundRate:null,leadMonths:1,payoutMonths:1,depositRate:.3,startupCosts:null,months:Array.from({length:12},()=>({orders:null,sales:null,fixedCosts:null}))},
    blocks:blockKeys.map(key=>({key,content:"",evidenceIds:[],reviewedAt:null,basis:""}))};
}
export const mutationSchema=z.object({expectedUpdatedAt:z.iso.datetime(),workspace:workspaceSchema,decision:z.object({choice:z.enum(["continue","revise","stop"]),rationale:z.string().trim().min(10).max(3000),evidenceIds:z.array(id).max(5)}).strict().optional()}).strict();

// A stable dependency key, not a quality score. Exact inputs are retained for inspectable review invalidation.
export function planBasis(w:Workspace) {
  const raw=JSON.stringify({cash:w.cash,sizing:w.sizing,evidence:w.evidence,experiments:w.experiments},(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value);
  let a=2166136261,b=5381;for(let i=0;i<raw.length;i++){a=Math.imul(a^raw.charCodeAt(i),16777619);b=Math.imul(b,33)^raw.charCodeAt(i);}
  return `${(a>>>0).toString(16)}-${(b>>>0).toString(16)}`;
}
export function applyWorkspace(previous:SavedWorkspace|undefined,raw:unknown,at:string):SavedWorkspace {
  const {workspace:w,decision}=mutationSchema.parse(raw);
  const basis=planBasis(w);
  const blocks=w.blocks.map(b=>{
    const old=previous?.blocks.find(p=>p.key===b.key);
    // A reviewer may acknowledge current inputs only by submitting the exact current dependency key.
    if(b.reviewedAt && b.basis===basis&&(b.reviewedAt!==old?.reviewedAt||b.basis!==old?.basis))return {...b,reviewedAt:at};
    return {...b,reviewedAt:b.reviewedAt&&old?.content===b.content&&JSON.stringify(old?.evidenceIds)===JSON.stringify(b.evidenceIds)?old?.reviewedAt??null:null,basis:old?.basis??""};
  });
  const decisions=[...(previous?.decisions??[])];
  if(decision){
    if(decisions.length>=30)throw new Error("DECISION_LIMIT");
    if(decision.evidenceIds.some(e=>!w.evidence.some(s=>s.id===e)))throw new Error("MISSING_EVIDENCE");
    decisions.push({...decision,id:crypto.randomUUID(),at,evidenceSnapshot:structuredClone(w.evidence.filter(e=>decision.evidenceIds.includes(e.id)))});
  }
  const revision=(previous?.revision??0)+1,planVersions=[...(previous?.planVersions??[])];
  if(w.blocks.some(b=>b.content.trim())&&(!previous||planBasis(previous)!==basis||JSON.stringify(previous.blocks)!==JSON.stringify(blocks)))planVersions.push({revision,at,blocks:structuredClone(blocks),cash:structuredClone(w.cash),sizing:structuredClone(w.sizing)});
  return {...w,blocks,revision,decisions,planVersions:planVersions.slice(-10)};
}

export function cashForecast(input:CashInput) {
  const parsed=cashInputSchema.safeParse(input);
  if(!parsed.success)return {status:"incomplete" as const,unknown:["Invalid assumptions: use nonnegative amounts and valid rates."],rows:[],fundingGap:null,minCash:null,receivable:null,committedPayments:null};
  const p=parsed.data;
  const unknown=Object.entries(p).filter(([k,v])=>k!=="months"&&v===null).map(([k])=>k);
  if(p.months.some(m=>Object.values(m).some(v=>v===null)))unknown.push("monthly orders, sales and fixed costs");
  if(unknown.length)return {status:"incomplete" as const,unknown,rows:[],fundingGap:null,minCash:null,receivable:null,committedPayments:null};
  const capacity=p.months.reduce((sum,m)=>sum+m.orders!+m.sales!,0)+p.openingStock!;
  if(capacity*Math.max(p.price!,p.unitCost!,p.logistics!+p.packaging!+p.acquisition!,1)*100>Number.MAX_SAFE_INTEGER/4)return {status:"out_of_range" as const,unknown:["Amounts exceed the safe calculation range"],rows:[],fundingGap:null,minCash:null,receivable:null,committedPayments:null};
  // All ledger amounts are integer cents (VND uses whole currency units). Currency scaling is supplied by caller below.
  return calculateSchedule(p,100);
}
export function marketSizing(s:Workspace["sizing"]){
  const {customers,annualSpend,serviceableRate,reachableCustomers}=s;
  if(customers===null||annualSpend===null||serviceableRate===null||reachableCustomers===null)return null;
  if([customers,annualSpend,serviceableRate,reachableCustomers].some(v=>!Number.isFinite(v)||v<0)||serviceableRate>1)return {status:"invalid" as const,tam:null,sam:null,som:null};
  const served=customers*serviceableRate;
  if(reachableCustomers>served)return {status:"invalid" as const,tam:null,sam:null,som:null};
  return {status:"assumption" as const,tam:customers*annualSpend,sam:served*annualSpend,som:reachableCustomers*annualSpend};
}
export function forecast(input:CashInput,currency:string){
  const checked=cashForecast(input);
  return checked.status==="incomplete"||checked.status==="out_of_range"?checked:calculateSchedule(input,currency==="VND"?1:100);
}
function calculateSchedule(p:CashInput,scale:number){
  const cents=(n:number|null)=>Math.round(n!*scale),money=(n:number)=>n/scale;
  const price=cents(p.price),cost=cents(p.unitCost),variable=cents(p.logistics)+cents(p.packaging)+cents(p.acquisition);
  let cash=cents(p.openingCash),stock=p.openingStock!,minCash=cash;
  const receipts=Array(16).fill(0),balances=Array(16).fill(0),arrivals=Array(16).fill(0);
  const rows=[];let invalid=false;
  for(let i=0;i<12;i++){
    const m=p.months[i],order=m.orders!,sales=m.sales!;
    const full=cost*order,deposit=Math.round(full*p.depositRate);
    arrivals[i+p.leadMonths]+=order;balances[i+p.leadMonths]+=full-deposit;
    const available=stock+arrivals[i],shortage=Math.max(0,sales-available);
    if(shortage)invalid=true;
    const gross=price*sales,fee=Math.round(gross*p.feeRate!),refund=Math.round(gross*p.refundRate!);
    receipts[i+p.payoutMonths]+=gross-fee-refund;
    const operatingCash=variable*sales+cents(m.fixedCosts)+(i===0?cents(p.startupCosts):0);
    const paid=deposit+balances[i],opening=cash;
    cash+=receipts[i]-paid-operatingCash;stock=available-sales;minCash=Math.min(minCash,cash);
    rows.push({month:i+1,orders:order,sales,arrivals:arrivals[i],stock,shortage,grossSales:money(gross),fees:money(fee),refunds:money(refund),cogs:money(cost*sales),opening:money(opening),receipts:money(receipts[i]),supplierPayments:money(paid),operatingCash:money(operatingCash),closing:money(cash),contribution:money(gross-fee-refund-(cost+variable)*sales),operatingResult:money(gross-fee-refund-(cost+variable)*sales-cents(m.fixedCosts)-(i===0?cents(p.startupCosts):0))});
  }
  return {status:invalid?"stockout" as const:"ready" as const,unknown:[],rows,fundingGap:invalid?null:money(Math.max(0,-minCash)),minCash:money(minCash),receivable:money(receipts.slice(12).reduce((a,b)=>a+b,0)),committedPayments:money(balances.slice(12).reduce((a,b)=>a+b,0))};
}
