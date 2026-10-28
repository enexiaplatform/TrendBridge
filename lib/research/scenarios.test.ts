import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { sampleRun } from "./sample";
import { nextUpdatedAt, saveScenario, scenarioSnapshot, scenarioValues } from "./scenarios";
import { LocalResearchStore } from "./store";
import { reportHtml, reportWorkbook } from "./exports";

const id = "00000000-0000-4000-8000-000000000001";
function scenario() { return { id, name:"Higher acquisition cost",notes:"Test, not a market estimate",values:{...scenarioValues(sampleRun().input),advertising:12} }; }
describe("saved financial scenarios",()=>{
  it("calculates independently without changing baseline or converting unknowns to zero",()=>{
    const run=sampleRun(); const original=run.snapshot.financials?.contributionProfit;
    run.scenarios=saveScenario(run,scenario());
    expect(scenarioSnapshot(run.input,run.scenarios[0]).financials?.contributionProfit).toBeCloseTo(-.35);
    expect(run.snapshot.financials?.contributionProfit).toBe(original);
    expect(scenarioSnapshot(run.input,{...scenario(),values:{...scenario().values,advertising:null}}).financials).toBeNull();
  });
  it("rejects fee over 99%, arbitrary scope overrides, nonfinite and missing FX",()=>{
    const run=sampleRun();
    expect(()=>saveScenario(run,{...scenario(),values:{...scenario().values,platformFeeRate:1}})).toThrow();
    expect(()=>saveScenario(run,{...scenario(),values:{...scenario().values,market:"VN"}})).toThrow();
    expect(()=>saveScenario(run,{...scenario(),values:{...scenario().values,advertising:Infinity}})).toThrow();
    expect(()=>saveScenario({...run,input:{...run.input,costCurrency:"CNY"}},scenario())).toThrow();
  });
  it("caps at five but permits editing, and prevents stale writes from erasing changes",()=>{
    const run=sampleRun();for(let n=1;n<=5;n++)run.scenarios=saveScenario(run,{...scenario(),id:`00000000-0000-4000-8000-00000000000${n}`});
    expect(()=>saveScenario(run,{...scenario(),id:"00000000-0000-4000-8000-000000000006"})).toThrow("SCENARIO_LIMIT");
    expect(saveScenario(run,{...scenario(),name:"Updated"})).toHaveLength(5);
    const store=new LocalResearchStore(":memory:");
    try {
      store.create(run);const updated={...run,updatedAt:nextUpdatedAt(run.updatedAt)};store.save(updated,run.updatedAt);
      expect(()=>store.save({...run,scenarios:[]},run.updatedAt)).toThrow("WRITE_CONFLICT");
      expect(store.get(run.ownerId,run.id)?.scenarios).toHaveLength(5);
      expect(()=>store.save({...updated,ownerId:"other"},updated.updatedAt)).toThrow("WRITE_CONFLICT");
    }finally{store.close();}
  });
  it("exports saved inputs, formula results and escaped rationale consistently",async()=>{
    const run=sampleRun();run.scenarios=saveScenario(run,{...scenario(),name:'=HYPERLINK("bad")',notes:'<script>alert(1)</script>'});
    const html=reportHtml(run);expect(html).toContain("&lt;script&gt;");expect(html).toContain("-$0.35");
    const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(await reportWorkbook(run));const sheet=workbook.getWorksheet("Financial Scenarios")!;
    expect(sheet.getCell("A3").type).toBe(ExcelJS.ValueType.String);expect(sheet.getCell("H3").value).toBe(12);
    expect(sheet.getCell("J3").formula).toBe("D3-E3*F3-G3-H3-D3*I3");expect(sheet.getCell("J3").result).toBeCloseTo(-.35);
    expect(sheet.getCell("J2").result).toBeCloseTo(6.65);
  });
});
