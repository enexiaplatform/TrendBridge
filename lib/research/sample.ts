import { buildFixture, buildSnapshot, publicRun, type Run } from "./report";
import type { ResearchInput } from "./contract";
export function sampleRun():Run {
  const input:ResearchInput={name:"Insulated travel mug",description:"Illustrative financial scenario, not market research.",reference:"",market:"US",channel:"Amazon",language:"en",currency:"USD",costCurrency:"USD",fxRate:null,configuration:"500 ml, stainless steel, single pack — illustrative specification, not verified",sellingPrice:29,purchaseCost:9,logistics:4,advertising:5,platformFeeRate:.15};
  return {id:"sample",ownerId:"public-sample",requestKey:"sample",createdAt:"2026-10-28T00:00:00.000Z",updatedAt:"2026-10-28T00:00:00.000Z",input,snapshot:buildSnapshot(input),status:"partial",provider:"fixture",entitlement:"fixture",report:buildFixture(input),scenarios:[{id:"00000000-0000-4000-8000-000000000001",name:"Higher acquisition cost",notes:"Illustrative sensitivity test, not market research.",values:{sellingPrice:29,purchaseCost:9,logistics:4,advertising:12,platformFeeRate:.15,fxRate:null}}]};
}
export function sampleReport(){return {...publicRun(sampleRun()),testUnlock:false};}
