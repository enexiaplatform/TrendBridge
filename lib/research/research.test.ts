import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { researchInputSchema, validateResearch } from "./contract";
import { buildFixture, buildSnapshot, publicRun } from "./report";
import { sampleRun } from "./sample";
import { LocalResearchStore } from "./store";
import { reportHtml, reportWorkbook } from "./exports";
import { ManusAdapter, manusRequest } from "./manus";

describe("global validation contract",()=>{
  it("keeps an unknown cost unknown instead of manufacturing profit",()=>{const input={...sampleRun().input,purchaseCost:null};const snapshot=buildSnapshot(input);expect(snapshot.financials).toBeNull();expect(snapshot.unknowns).toContain("Purchase cost");expect(snapshot.verdict).toBe("HOLD");});
  it("distinguishes an explicit zero from an unknown",()=>{expect(buildSnapshot({...sampleRun().input,advertising:0}).financials).not.toBeNull();});
  it("requires FX for cross-currency costs",()=>{expect(researchInputSchema.safeParse({...sampleRun().input,costCurrency:"CNY",fxRate:null}).success).toBe(false);});
  it("uses the user supplied FX only on the purchase cost",()=>{const f=buildSnapshot({...sampleRun().input,purchaseCost:70,costCurrency:"CNY",fxRate:.14}).financials!;expect(f.contributionProfit).toBeCloseTo(29-9.8-4-5-29*.15);});
  it("rejects currency/market shortcuts and nonfinite amounts",()=>{expect(researchInputSchema.safeParse({...sampleRun().input,sellingPrice:Infinity}).success).toBe(false);expect(researchInputSchema.safeParse({...sampleRun().input,market:"Earth"}).success).toBe(false);});
  it("does not infer product configuration from unrelated fixtures",()=>{expect(buildSnapshot({...sampleRun().input,name:"Travel backpack",configuration:""}).configuration).toBeNull();});
  it("strips full report data from the preview projection",()=>{const run={...sampleRun(),entitlement:"preview" as const};const result=publicRun(run);expect(result.report).toBeNull();expect(result).not.toHaveProperty("ownerId");expect(result).not.toHaveProperty("requestKey");});
});

describe("evidence gates and dormant Manus adapter",()=>{
  it("accepts a fixture as hypotheses, never as observations",()=>{const f=buildFixture(sampleRun().input);expect(validateResearch(f).issues).toEqual([]);expect(f.sources).toHaveLength(0);expect(f.claims.every(c=>c.kind==="hypothesis")).toBe(true);});
  it("rejects missing source references and unsupported observations",()=>{const f=buildFixture(sampleRun().input);f.claims[0].kind="observation";f.claims[0].sourceIds=["missing"];const result=validateResearch(f);expect(result.data).toBeNull();expect(result.issues.map(i=>i.code)).toContain("missing_source");expect(result.issues.map(i=>i.code)).toContain("unsupported_observation");});
  it("rejects malformed provider payloads",()=>{expect(validateResearch({report:"looks convincing"}).data).toBeNull();});
  it("builds a private, schema-bound Manus request",()=>{const request=manusRequest(sampleRun().input);expect(request.share_visibility).toBe("private");expect(request.structured_output_schema.additionalProperties).toBe(false);expect(request.message.content[0].text).toContain("untrusted data");});
  it("never calls live Manus without activation",async()=>{await expect(new ManusAdapter("test-never-sent").create(sampleRun().input)).rejects.toThrow("not enabled");});
});

describe("durable storage boundaries",()=>{
  it("survives reconnect, isolates owners and reuses duplicate requests",()=>{
    const dir=mkdtempSync(join(tmpdir(),"tb-store-test-"));const file=join(dir,"runs.sqlite");let store=new LocalResearchStore(file);
    try {const run=sampleRun();store.create(run);const duplicate=store.create({...run,id:"different"});expect(duplicate.id).toBe(run.id);expect(store.get("other-customer",run.id)).toBeNull();expect(store.list("other-customer")).toEqual([]);store.close();store=new LocalResearchStore(file);expect(store.get(run.ownerId,run.id)?.input.name).toBe(run.input.name);}
    finally{store.close();rmSync(dir,{recursive:true,force:true});}
  });
  it("enforces hourly limits while allowing idempotent retries",()=>{const store=new LocalResearchStore(":memory:");try{for(let i=0;i<10;i++)store.create({...sampleRun(),id:String(i),requestKey:String(i),createdAt:new Date().toISOString()});expect(()=>store.create({...sampleRun(),id:"eleven",requestKey:"eleven",createdAt:new Date().toISOString()})).toThrow("RATE_LIMIT");expect(store.create({...sampleRun(),id:"retry",requestKey:"0"}).id).toBe("0");}finally{store.close();}});
});

describe("one report, consistent exports",()=>{
  it("escapes untrusted text in printable HTML",()=>{const run=sampleRun();run.input.name='<img src=x onerror="alert(1)">';const html=reportHtml(run);expect(html).toContain("&lt;img");expect(html).not.toContain('<img src=x');expect(html).toContain("TEST TEMPLATE");expect(html).toContain("HOLD");});
  it("exports editable formulas from saved inputs and keeps user text as string cells",async()=>{const run=sampleRun();run.input.name='=HYPERLINK("https://example.invalid")';const bytes=await reportWorkbook(run);const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(bytes);expect(workbook.getWorksheet("Financial Model")?.getCell("B9").formula).toContain("B3*B5");expect(workbook.getWorksheet("Read me")?.getCell("B1").type).toBe(ExcelJS.ValueType.String);expect(workbook.worksheets.map(w=>w.name)).toContain("Research Evidence");});
});
