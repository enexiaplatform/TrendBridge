import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { channelForecast, emptyStrategy, monthlySignal, strategySchema } from "./model";
import { illustrativeStrategy } from "./sample";
import { applyWorkspace, emptyWorkspace, planBasis, workspaceSchema } from "@/lib/launch/model";
import { launchHtml, launchWorkbook } from "@/lib/launch/exports";
import { sampleRun } from "@/lib/research/sample";
import { planStarter } from "@/lib/launch/plan";

describe("Market Intelligence and GTM contracts",()=>{
  it("accepts old workspaces and strict illustrative strategy, rejects invalid references and spoofed fields",()=>{
    const {revision:_r,decisions:_d,planVersions:_p,...oldWorkspace}=emptyWorkspace();
    expect(workspaceSchema.safeParse(oldWorkspace).success).toBe(true);
    const s=illustrativeStrategy();expect(strategySchema.safeParse(s).success).toBe(true);
    expect(strategySchema.safeParse({...s,verified:true}).success).toBe(false);
    expect(strategySchema.safeParse({...s,segments:[s.segments[0],s.segments[0]]}).success).toBe(false);
    expect(strategySchema.safeParse({...s,segments:[]}).success).toBe(false);
    expect(strategySchema.safeParse({...s,channels:[]}).success).toBe(false);
    const w={...emptyWorkspace(),strategy:s};w.strategy.segments[0].sourceIds=[crypto.randomUUID()];
    expect(workspaceSchema.safeParse(w).success).toBe(false);
  });
  it("retains zero, missing and invalid as distinct acquisition states",()=>{
    const base=illustrativeStrategy().channels[0];
    expect(channelForecast({...base,cpc:null}).status).toBe("incomplete");
    expect(channelForecast({...base,cpc:0}).status).toBe("invalid");
    expect(channelForecast({...base,budget:0})).toMatchObject({status:"modeled",visits:0,leads:0,customers:0,cac:null,revenue:0,contribution:0});
    expect(channelForecast({...base,winRate:0})).toMatchObject({customers:0,cac:null,contribution:-1500});
    expect(channelForecast({...base,revenuePerCustomer:null,contributionPerCustomer:null})).toMatchObject({revenue:null,contribution:null});
    expect(channelForecast({...base,leadRate:1.1}).status).toBe("invalid");
    expect(channelForecast(base,Infinity).status).toBe("invalid");
    expect(channelForecast({...base,budget:1e10,cpc:1e-10}).status).toBe("invalid");
    expect(channelForecast({...base,contributionPerCustomer:30,revenuePerCustomer:29}).status).toBe("invalid");
  });
  it("reconciles independently rounded cohorts and preserves losses under sensitivity",()=>{
    const base=illustrativeStrategy().channels[0],f=channelForecast(base);
    expect(f).toMatchObject({visits:1000,leads:80,customers:9,revenue:261});
    expect(f.cac).toBeCloseTo(1500/9);expect(f.contribution).toBeCloseTo(9*10.65-1500);
    const low=channelForecast(base,.7),high=channelForecast(base,1.3);
    expect(low.leads).toBe(Math.floor(1000*.08*.7));expect(low.customers).toBe(Math.floor(low.leads!*.12*.7));
    expect(high.customers).toBeGreaterThan(f.customers!);
    const capped=channelForecast({...base,leadRate:1,winRate:1},1.3);expect(capped.customers).toBe(capped.visits);
    expect(channelForecast({...base,budget:.3,cpc:.1,leadRate:1,winRate:1})).toMatchObject({visits:3,customers:3});
    expect(channelForecast({...base,contributionPerCustomer:-2}).contribution).toBe(-1518);
  });
  it("leaves missing months as gaps and rejects duplicate, future and invalid periods",()=>{
    const signal={metric:"Demand index",unit:"points",definition:"User-recorded",points:[{month:"2026-01",value:0,sourceIds:[]},{month:"2026-03",value:10,sourceIds:[]}]};
    expect(monthlySignal(signal)?.map(p=>p.value)).toEqual([0,null,10]);
    expect(monthlySignal({...signal,points:[{month:"",value:10,sourceIds:[]}]})).toBeNull();
    expect(monthlySignal({...signal,points:[{month:"2020-01",value:1,sourceIds:[]},...signal.points]})).toBeNull();
    const s=emptyStrategy();s.signal=signal;
    expect(strategySchema.safeParse(s).success).toBe(true);
    expect(strategySchema.safeParse({...s,signal:{...signal,points:[signal.points[0],signal.points[0]]}}).success).toBe(false);
    expect(strategySchema.safeParse({...s,signal:{...signal,points:[{month:"2099-01",value:10,sourceIds:[]}]}}).success).toBe(false);
    const example=illustrativeStrategy();example.plays[0].endWeek=0;expect(strategySchema.safeParse(example).success).toBe(false);
  });
  it("invalidates plan reviews and retains strategy at the saved written-plan revision",()=>{
    const old=emptyWorkspace();old.blocks[0].content="An actual written plan";old.strategy=illustrativeStrategy();old.blocks[0].basis=planBasis(old);old.blocks[0].reviewedAt="2026-10-29T00:00:00.000Z";
    const changed=structuredClone(old);changed.strategy!.positioning.promise="A changed strategic promise";
    expect(planBasis(changed)).not.toBe(planBasis(old));
    const {revision:_r,decisions:_d,planVersions:_p,...workspace}=changed;
    const saved=applyWorkspace(old,{expectedUpdatedAt:"2026-10-29T00:00:00.000Z",workspace},"2026-10-30T00:00:00.000Z");
    expect(saved.blocks[0].basis).not.toBe(planBasis(saved));expect(saved.planVersions[0].strategy?.positioning.promise).toBe("A changed strategic promise");
    changed.strategy!.positioning.promise="Later edit";expect(saved.planVersions[0].strategy?.positioning.promise).not.toBe("Later edit");
  });
  it("reuses saved strategic inputs in deterministic plan drafts without asserting verified demand",()=>{
    const run=sampleRun();const draft=planStarter(run,run.workspace!,"customer",false);
    expect(draft).toContain("Daily commuters");expect(draft).toContain("unverified assumptions");
    const channels=planStarter(run,run.workspace!,"channels",false);expect(channels).toContain("modeled customers 9");expect(channels.length).toBeLessThanOrEqual(3000);
  });
  it("exports saved assumptions and identical scenario math, escaping untrusted prose",async()=>{
    const run=sampleRun();run.workspace!.strategy!.positioning.promise='<script>alert("x")</script>';
    const html=launchHtml(run);expect(html).toContain("Market Intelligence &amp; GTM Strategy");expect(html).toContain("&lt;script&gt;");expect(html).not.toContain('<script>alert("x")</script>');expect(html).toContain("<svg");
    const book=new ExcelJS.Workbook();await book.xlsx.load(await launchWorkbook(run));
    const sheet=book.getWorksheet("GTM sensitivity")!;expect(sheet.rowCount).toBe(7);
    const base=channelForecast(run.workspace!.strategy!.channels[0]);
    expect(sheet.getCell("D3").value).toBe("modeled");expect(sheet.getCell("G3").value).toBe(base.customers);expect(sheet.getCell("J3").value).toBeCloseTo(base.contribution!);
    expect(book.getWorksheet("Customer segments")!.rowCount).toBe(4);
    expect(book.getWorksheet("Competitive intelligence")!.getCell("F2").value).toBe("USD");
  });
});
