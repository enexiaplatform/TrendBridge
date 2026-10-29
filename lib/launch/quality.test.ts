import {it,expect} from "vitest";
import {collectionQuality} from "./quality";
import {emptyWorkspace,applyWorkspace,planBasis,type Evidence} from "./model";
const at="2026-10-29T00:00:00.000Z";
it("flags expired, stale, noncomparable observations and duplicate sources without certifying claims",()=>{
  const e:Evidence={id:crypto.randomUUID(),kind:"supplier",title:"Supplier quote",url:"https://example.com/quote",excerpt:"Quoted price",configuration:"",observedOn:"2026-08-01",limitations:"Not audited",price:10,currency:"USD",packSize:null,match:"comparable",quoteExpiresOn:"2026-10-01"};
  const flags=collectionQuality([e,{...e,id:crypto.randomUUID(),url:e.url+"#another"}],new Date(at));
  expect(flags.map(f=>f.code)).toEqual(expect.arrayContaining(["stale","quote_expired","scope_gap","unit_gap","duplicate_url"]));
});
it("makes review keys independent of object property insertion order",()=>{
  const w=emptyWorkspace(),reordered={...w,cash:Object.fromEntries(Object.entries(w.cash).reverse()) as typeof w.cash};expect(planBasis(w)).toBe(planBasis(reordered));
});
it("pins decision sources and keeps a bounded history of plan revisions",()=>{
  let w=emptyWorkspace();const e:Evidence={id:crypto.randomUUID(),kind:"customer",title:"Customer interview",url:"https://example.com/interview",excerpt:"Original customer feedback",configuration:"",observedOn:"2026-10-01",limitations:"Single interview",price:null,currency:"USD",packSize:null,match:"not_applicable"};w.evidence=[e];w.blocks[0].content="Interview buyers";
  const payload=(draft=w)=>{const {revision:_,decisions:__,planVersions:___,...workspace}=draft;return {expectedUpdatedAt:at,workspace};};
  w=applyWorkspace(undefined,{...payload(),decision:{choice:"revise",rationale:"One interview is insufficient",evidenceIds:[e.id]}},at);
  for(let i=0;i<12;i++){const draft=structuredClone(w);draft.evidence=[];draft.blocks[0].content=`Version ${i}`;w=applyWorkspace(w,payload(draft),at);}
  expect(w.decisions[0].evidenceSnapshot[0].excerpt).toBe("Original customer feedback");expect(w.planVersions).toHaveLength(10);
});
