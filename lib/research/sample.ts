import { buildFixture, buildSnapshot, publicRun, type Run } from "./report";
import type { ResearchInput } from "./contract";
import { emptyWorkspace } from "@/lib/launch/model";
export function sampleRun():Run {
  const input:ResearchInput={name:"Insulated travel mug",description:"Illustrative financial scenario, not market research.",reference:"",market:"US",channel:"Amazon",language:"en",currency:"USD",costCurrency:"USD",fxRate:null,configuration:"500 ml, stainless steel, single pack — illustrative specification, not verified",sellingPrice:29,purchaseCost:9,logistics:4,advertising:5,platformFeeRate:.15};
  const workspace=emptyWorkspace();workspace.project="Illustrative launch";workspace.stage="validating";
  workspace.cash={...workspace.cash,openingCash:2000,openingStock:0,price:29,unitCost:9,logistics:4,packaging:1,acquisition:5,feeRate:.15,refundRate:0,startupCosts:200,months:Array.from({length:12},(_,i)=>({orders:i===0?100:0,sales:i===1||i===2?40:i===3?20:0,fixedCosts:100}))};
  workspace.cashScenarios=[{id:"00000000-0000-4000-8000-000000000002",name:"Illustrative base",cash:structuredClone(workspace.cash)},{id:"00000000-0000-4000-8000-000000000003",name:"Higher acquisition",cash:{...structuredClone(workspace.cash),acquisition:12}}];
  workspace.blocks[0].content="ILLUSTRATIVE INPUT-BASED DRAFT — no market research. Confirm the exact configuration, obtain a real supplier quote and test demand before committing to stock. Launch cash assumptions show why positive unit contribution does not remove funding risk.";
  return {workspace,id:"sample",ownerId:"public-sample",requestKey:"sample",createdAt:"2026-10-28T00:00:00.000Z",updatedAt:"2026-10-28T00:00:00.000Z",input,snapshot:buildSnapshot(input),status:"partial",provider:"fixture",entitlement:"fixture",report:buildFixture(input),scenarios:[{id:"00000000-0000-4000-8000-000000000001",name:"Higher acquisition cost",notes:"Illustrative sensitivity test, not market research.",values:{sellingPrice:29,purchaseCost:9,logistics:4,advertising:12,platformFeeRate:.15,fxRate:null}}]};
}
export function sampleReport(){return {...publicRun(sampleRun()),testUnlock:false};}
