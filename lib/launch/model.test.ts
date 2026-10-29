import { describe,it,expect } from "vitest";
import ExcelJS from "exceljs";
import { applyWorkspace,emptyWorkspace,experimentSchema,forecast,marketSizing,mutationSchema,planBasis,type CashInput } from "./model";
import { launchHtml,launchWorkbook } from "./exports";
import { sampleRun } from "@/lib/research/sample";
const at="2026-10-29T00:00:00.000Z";
function cash():CashInput{return {openingCash:1000,openingStock:0,price:20,unitCost:5,logistics:1,packaging:1,acquisition:2,feeRate:.1,refundRate:0,leadMonths:1,payoutMonths:1,depositRate:.3,startupCosts:100,months:Array.from({length:12},()=>({orders:0,sales:0,fixedCosts:10}))};}
function payload(w=emptyWorkspace()){const {revision:_,decisions:__,planVersions:___,...workspace}=w;return {workspace,expectedUpdatedAt:at};}
describe("launch planning and decision integrity",()=>{
  it("keeps missing assumptions unknown and zero explicitly valid",()=>{
    expect(forecast(emptyWorkspace().cash,"USD").status).toBe("incomplete");
    const p=cash();p.openingCash=0;p.startupCosts=0;p.months=p.months.map(m=>({...m,fixedCosts:0}));
    expect(forecast(p,"USD")).toMatchObject({status:"ready",fundingGap:0,minCash:0});
    expect(forecast({...p,feeRate:1},"USD").status).toBe("incomplete");
  });
  it("separates purchases, COGS and delayed cash; reconciles every row independently",()=>{
    const p=cash();p.months[0].orders=100;p.months[1].sales=40;
    const f=forecast(p,"USD");expect(f.status).toBe("ready");
    // Month 1: 1000 - 150 deposit - 100 setup - 10 fixed = 740.
    expect(f.rows[0]).toMatchObject({closing:740,stock:0,supplierPayments:150,operatingResult:-110});
    // Month 2: 740 - 350 balance - 160 variable - 10 fixed = 220; receipts arrive month 3.
    expect(f.rows[1]).toMatchObject({closing:220,stock:60,receipts:0,contribution:360,operatingResult:350});
    expect(f.rows[2]).toMatchObject({closing:930,receipts:720,stock:60});
    let stock=0;for(const r of f.rows){expect(r.closing).toBeCloseTo(r.opening+r.receipts-r.supplierPayments-r.operatingCash,8);expect(r.stock).toBe(stock+r.arrivals-r.sales);stock=r.stock;}
    expect(f.fundingGap).toBe(0);
  });
  it("retains negative cash and detects infeasible sales before arrival",()=>{
    const p=cash();p.openingCash=0;p.months[0].orders=100;p.months[0].sales=1;
    const f=forecast(p,"USD");expect(f.status).toBe("stockout");expect(f.rows[0].shortage).toBe(1);expect(f.minCash).toBeLessThan(0);expect(f.fundingGap).toBeNull();
  });
  it("retains year-end commitments/receipts and handles zero-month lags",()=>{
    const p=cash();p.openingStock=20;p.months[11]={orders:100,sales:10,fixedCosts:10};
    const f=forecast(p,"USD");expect(f.receivable).toBe(180);expect(f.committedPayments).toBe(350);
    const q=cash();q.leadMonths=0;q.payoutMonths=0;q.months[0]={orders:10,sales:10,fixedCosts:10};q.refundRate=.1;
    expect(forecast(q,"USD").rows[0]).toMatchObject({arrivals:10,stock:0,receipts:160,supplierPayments:50,closing:960,operatingResult:-40});
  });
  it("does not convert an oversized model into imprecise floating-point money",()=>{
    const p=cash();p.price=1e10;p.months[0].sales=1e7;expect(forecast(p,"USD").status).toBe("out_of_range");
  });
  it("requires bounded, recorded results rather than one-click success",()=>{
    const test={id:crypto.randomUUID(),title:"Demand test",hypothesis:"People buy",method:"Interviews",owner:"",dueOn:"",budgetCap:100,spent:120,passCondition:"5 orders",stopCondition:"Budget cap",status:"passed",result:"5 orders",evidenceIds:[]};
    expect(experimentSchema.safeParse(test).success).toBe(false);expect(experimentSchema.safeParse({...test,status:"stopped"}).success).toBe(true);
    expect(experimentSchema.safeParse({...test,spent:null}).success).toBe(false);
  });
  it("keeps decision history server-owned and invalidates a plan review after changes",()=>{
    const w=emptyWorkspace();w.blocks[0]={...w.blocks[0],content:"Test a small batch",reviewedAt:at,basis:planBasis(w)};
    const first=applyWorkspace(undefined,{...payload(w),decision:{choice:"revise",rationale:"Need supplier evidence",evidenceIds:[]}},at);
    expect(first.revision).toBe(1);expect(first.decisions).toHaveLength(1);expect(first.blocks[0].basis).toBe(planBasis(w));
    const next=structuredClone(first);next.cash.price=30;
    const second=applyWorkspace(first,payload(next),"2026-10-29T00:00:01.000Z");
    expect(second.decisions).toEqual(first.decisions);expect(second.blocks[0].basis).not.toBe(planBasis(second));
    expect(mutationSchema.safeParse({...payload(w),decisions:[]}).success).toBe(false);
    expect(mutationSchema.safeParse({...payload(w),workspace:{...payload(w).workspace,entitlement:"paid"}}).success).toBe(false);
  });
  it("preserves provenance references and rejects invented sizing shares",()=>{
    const w=emptyWorkspace();w.blocks[0].evidenceIds=[crypto.randomUUID()];expect(mutationSchema.safeParse(payload(w)).success).toBe(false);
    expect(marketSizing(emptyWorkspace().sizing)).toBeNull();
    expect(marketSizing({customers:1000,annualSpend:100,serviceableRate:.2,reachableCustomers:25,sourceIds:[]})).toMatchObject({tam:100000,sam:20000,som:2500});
    expect(marketSizing({customers:1000,annualSpend:100,serviceableRate:.2,reachableCustomers:201,sourceIds:[]})?.status).toBe("invalid");
  });
  it("exports only user planning data, escapes HTML and leaves spreadsheet text as text",async()=>{
    const run=sampleRun();run.input.name='<script>alert(1)</script>';run.entitlement="preview";run.workspace=emptyWorkspace();run.workspace.cash=cash();run.workspace.blocks[0].content='=HYPERLINK("https://evil.invalid")';
    const html=launchHtml(run);expect(html).not.toContain("<script>");expect(html).toContain("&lt;script&gt;");expect(html).toContain("full paid research is not included".replace("full","Full"));
    const book=new ExcelJS.Workbook();await book.xlsx.load(await launchWorkbook(run) as never);
    expect(book.getWorksheet("Business plan")?.getCell("B2").value).toBe(run.workspace.blocks[0].content);
    expect(book.getWorksheet("Scope")?.getCell("B7").value).toBe(0);
    expect(book.worksheets.map(s=>s.name)).toContain("Cash and stock");
  });
});
