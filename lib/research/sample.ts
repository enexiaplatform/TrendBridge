import { buildFixture, buildSnapshot, publicRun, type Run } from "./report";
import type { ResearchInput } from "./contract";
export function sampleRun():Run {
  const input:ResearchInput={name:"Vacuum food storage container — sample",description:"Illustrative financial scenario, not market research.",reference:"",market:"US",channel:"Own store",language:"en",currency:"USD",costCurrency:"USD",fxRate:null,configuration:"Configuration not verified — sample only",sellingPrice:29,purchaseCost:9,logistics:4,advertising:5,platformFeeRate:.15};
  return {id:"sample",ownerId:"public-sample",requestKey:"sample",createdAt:"2026-10-28T00:00:00.000Z",updatedAt:"2026-10-28T00:00:00.000Z",input,snapshot:buildSnapshot(input),status:"partial",provider:"fixture",entitlement:"fixture",report:buildFixture(input)};
}
export function sampleReport(){return {...publicRun(sampleRun()),testUnlock:false};}
