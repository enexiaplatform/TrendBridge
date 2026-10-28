import { calculateFinancials } from "@/lib/financial";
import type { ResearchInput, ResearchOutput } from "./contract";
import { moduleDefinitions } from "./contract";

export function buildSnapshot(input: ResearchInput) {
  const unknowns: string[] = [];
  for (const [key, label] of [["purchaseCost", "Purchase cost"], ["logistics", "Shipping & fulfillment"], ["advertising", "Acquisition cost"], ["platformFeeRate", "Platform fee"], ["sellingPrice", "Selling price"]] as const) if (input[key] === null) unknowns.push(label);
  if (!input.configuration.trim()) unknowns.push("Exact product configuration");
  const financials = unknowns.some(x => x !== "Exact product configuration") ? null : calculateFinancials({
    sellingPrice: input.sellingPrice!, purchaseCost: input.purchaseCost! * (input.currency === input.costCurrency ? 1 : input.fxRate!),
    logistics: input.logistics!, advertising: input.advertising!, platformFeeRate: input.platformFeeRate!,
    paymentFeeRate: 0, fulfillment: 0, packaging: 0, returnLossRate: 0, otherVariableCosts: 0,
  });
  return {
    schemaVersion: "trendbridge.snapshot/v1" as const,
    product: input.name, configuration: input.configuration || null,
    classification: "User-described product; AI identification not performed",
    financials, unknowns,
    evidenceStatus: "unavailable" as const,
    verdict: "HOLD" as const,
    summary: input.language === "vi" ? "Chưa đủ bằng chứng độc lập để đưa ra quyết định đầu tư. Mô hình tài chính dùng giả định bạn nhập." : "Independent market and supplier evidence is still needed. Financial outputs use your assumptions only.",
    assumptions: ["All costs are per unit; shipping includes fulfillment.", "Fees apply to gross selling price; tax, returns, packaging and fixed costs are excluded unless included in your entered costs.", "FX is user-provided, not a live quote. Listed prices do not establish actual demand."],
    questions: ["How does this exact configuration compare with products in your target market?", "Can a supplier confirm landed cost, MOQ and product documents?", "What experiment would validate demand before committing to inventory?"],
    modules: moduleDefinitions.map(m => ({ ...m, status: "locked" as const })),
  };
}
export type Snapshot = ReturnType<typeof buildSnapshot>;
export type Run = {
  id: string; ownerId: string; createdAt: string; updatedAt: string; requestKey: string;
  status: "preview_ready" | "full_ready" | "partial" | "failed";
  input: ResearchInput; snapshot: Snapshot;
  provider: "disabled" | "fixture" | "manus";
  entitlement: "preview" | "fixture" | "paid";
  report: ResearchOutput | null;
};
export function publicRun(run: Run) {
  const unlocked = run.entitlement === "paid" || run.entitlement === "fixture";
  return { id: run.id, createdAt: run.createdAt, updatedAt: run.updatedAt, status: run.status, input: run.input, snapshot: run.snapshot, provider: run.provider, access: run.entitlement, report: unlocked ? run.report : null };
}
export type PublicRun = ReturnType<typeof publicRun>;
export function buildFixture(input: ResearchInput): ResearchOutput {
  return {
    schemaVersion: "trendbridge.research/v1", productConfiguration: input.configuration || "Unspecified — clarify before comparison", sources: [],
    competitors:[],suppliers:[],risks:[],
    experiments:[{id:"sample-validation",hypothesis:"The defined product solves a need customers will pay for.",method:"Run a small, explicitly budgeted customer or landing-page test after confirming product claims.",budget:null,currency:input.currency,passCondition:"Set your minimum qualified responses and maximum CAC before starting.",stopCondition:"Stop at the budget cap, an unverified material claim or an unresolved critical compliance issue.",nextAction:"Choose measurable thresholds, gather evidence and reassess the investment."}],
    claims: [
      { id: "fixture-scope", module: "decision", statement: "HOLD: collect external evidence before committing to inventory.", kind: "hypothesis", sourceIds: [], excerpt: null, implication: "Positive modeled contribution alone does not validate demand.", limitation: "Test template only. No Manus task or external research was run.", nextAction: "Obtain comparable listings, a supplier quote and a bounded demand test." },
      { id: "fixture-source", module: "sourcing", statement: "Supplier listing, identity verification and quality audit must be evaluated separately.", kind: "hypothesis", sourceIds: [], excerpt: null, implication: "A listing alone is insufficient for a purchase decision.", limitation: "No supplier is named or verified in this fixture.", nextAction: "Request sample cost, tier prices, MOQ, incoterm, lead time and supporting documents." },
      { id: "fixture-test", module: "validation", statement: "Set pass/fail and stop conditions before a small demand experiment.", kind: "hypothesis", sourceIds: [], excerpt: null, implication: "A bounded test limits capital exposure.", limitation: "Budget and acquisition assumptions must come from your own business.", nextAction: "Define a test budget, a maximum CAC and a minimum contribution threshold." },
    ],
    unresolvedQuestions: ["Demand has not been researched.", "No comparable competitor listings or supplier quotations were retrieved.", "Regulatory requirements have not been verified for this product and market."],
  };
}
