import { z } from "zod";
import { currencies } from "@/lib/global";

const amount = z.number().finite().min(0).max(1e12).nullable();
export const researchInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().max(3000).default(""),
  reference: z.union([z.literal(""), z.url().refine(v => new URL(v).protocol === "https:", "Use an HTTPS URL")]).default(""),
  market: z.enum(["US", "VN", "GB", "DE", "AU"]),
  channel: z.string().trim().min(2).max(80),
  language: z.enum(["en", "vi"]),
  currency: z.enum(currencies),
  costCurrency: z.enum(currencies),
  fxRate: z.number().positive().max(1e9).nullable(),
  configuration: z.string().trim().max(500),
  sellingPrice: amount,
  purchaseCost: amount,
  logistics: amount,
  advertising: amount,
  platformFeeRate: z.number().min(0).max(.99).nullable(),
}).strict().superRefine((v, ctx) => {
  if (v.currency !== v.costCurrency && v.purchaseCost !== null && v.fxRate === null) ctx.addIssue({ code: "custom", path: ["fxRate"], message: "Provide the conversion rate or leave purchase cost unknown" });
});
export type ResearchInput = z.infer<typeof researchInputSchema>;
export const moduleDefinitions = [
  { id: "decision", title: "Investment memo", question: "What must be true before you invest?" },
  { id: "market", title: "Market & demand", question: "What does the available evidence say about demand?" },
  { id: "competition", title: "Competitive landscape", question: "Which configurations and prices are truly comparable?" },
  { id: "customers", title: "Customer needs", question: "Which needs and complaints are supported by genuine reviews?" },
  { id: "sourcing", title: "Supplier shortlist", question: "Who offers this configuration and what remains unverified?" },
  { id: "economics", title: "Unit economics", question: "What selling price and acquisition cost can the business sustain?" },
  { id: "strategy", title: "Differentiation", question: "Which positioning hypotheses should you test?" },
  { id: "risks", title: "Risk register", question: "Which risks could invalidate the investment?" },
  { id: "validation", title: "Validation roadmap", question: "What should you test, and when should you stop?" },
] as const;
export const sourceSchema = z.object({
  id: z.string(), url: z.url().refine(v => new URL(v).protocol === "https:"), title: z.string(),
  retrievedAt: z.iso.datetime(), observedAt: z.iso.datetime().nullable(),
  publisher: z.string(), kind: z.enum(["primary", "listing", "review", "secondary"]), limitations: z.string(),
}).strict();
export const claimSchema = z.object({
  id: z.string(), module: z.enum(["decision", "market", "competition", "customers", "sourcing", "economics", "strategy", "risks", "validation"]),
  statement: z.string(), kind: z.enum(["observation", "user_provided", "hypothesis"]),
  sourceIds: z.array(z.string()), excerpt: z.string().nullable(), implication: z.string(), limitation: z.string(), nextAction: z.string(),
}).strict();
export const researchOutputSchema = z.object({
  schemaVersion: z.literal("trendbridge.research/v1"),
  productConfiguration: z.string(),
  sources: z.array(sourceSchema), claims: z.array(claimSchema),
  competitors: z.array(z.object({
    id:z.string(),title:z.string(),seller:z.string().nullable(),platform:z.string(),url:z.url(),
    configuration:z.string(),packQuantity:z.number().int().positive().nullable(),listedPrice:amount,currency:z.enum(currencies),
    similarity:z.enum(["comparable","partial","excluded"]),comparisonReason:z.string(),observedAt:z.iso.datetime(),sourceIds:z.array(z.string()).min(1),
  }).strict()),
  suppliers: z.array(z.object({
    id:z.string(),name:z.string(),location:z.string().nullable(),url:z.url(),productConfiguration:z.string(),
    indicativePriceMin:amount,indicativePriceMax:amount,currency:z.enum(currencies),moq:z.number().int().nonnegative().nullable(),
    incoterm:z.string().nullable(),identityVerified:z.literal(false),qualityAudited:z.literal(false),
    observedAt:z.iso.datetime(),sourceIds:z.array(z.string()).min(1),limitations:z.string(),
  }).strict()),
  risks:z.array(z.object({id:z.string(),category:z.enum(["regulatory","quality","supply_chain","commercial","marketing_claim"]),description:z.string(),severity:z.enum(["low","medium","high","critical"]),kind:z.enum(["observation","hypothesis"]),sourceIds:z.array(z.string()),impact:z.string(),action:z.string(),limitations:z.string()}).strict()),
  experiments:z.array(z.object({id:z.string(),hypothesis:z.string(),method:z.string(),budget:amount,currency:z.enum(currencies),passCondition:z.string(),stopCondition:z.string(),nextAction:z.string()}).strict()),
  unresolvedQuestions: z.array(z.string()),
}).strict();
export type ResearchOutput = z.infer<typeof researchOutputSchema>;
export type EvidenceIssue = { code: string; detail: string };
export function validateResearch(raw: unknown): { data: ResearchOutput | null; issues: EvidenceIssue[] } {
  const parsed = researchOutputSchema.safeParse(raw);
  if (!parsed.success) return { data: null, issues: [{ code: "invalid_schema", detail: parsed.error.message }] };
  const { data } = parsed;
  const issues: EvidenceIssue[] = [];
  const sourceIds = new Set(data.sources.map(s => s.id));
  if (sourceIds.size !== data.sources.length) issues.push({ code: "duplicate_source", detail: "Duplicate source IDs" });
  if (new Set(data.claims.map(c => c.id)).size !== data.claims.length) issues.push({ code: "duplicate_claim", detail: "Duplicate claim IDs" });
  for (const claim of data.claims) {
    if (claim.kind === "observation" && (!claim.sourceIds.length || !claim.excerpt?.trim())) issues.push({ code: "unsupported_observation", detail: claim.id });
    if (claim.sourceIds.some(id => !sourceIds.has(id))) issues.push({ code: "missing_source", detail: claim.id });
  }
  for (const source of data.sources) if (Date.parse(source.retrievedAt) > Date.now() + 60_000) issues.push({ code: "future_retrieval", detail: source.id });
  for(const row of [...data.competitors,...data.suppliers,...data.risks]){
    if(row.sourceIds.some(id=>!sourceIds.has(id)))issues.push({code:"missing_source",detail:row.id});
    if("kind" in row && row.kind==="observation" && !row.sourceIds.length)issues.push({code:"unsupported_observation",detail:row.id});
  }
  for(const supplier of data.suppliers)if(supplier.indicativePriceMin!==null&&supplier.indicativePriceMax!==null&&supplier.indicativePriceMin>supplier.indicativePriceMax)issues.push({code:"invalid_price_range",detail:supplier.id});
  // These are structural checks, not proof that a remote page supports a claim.
  return { data: issues.length ? null : data, issues };
}
