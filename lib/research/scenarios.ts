import { z } from "zod";
import { researchInputSchema, type ResearchInput } from "./contract";
import { buildSnapshot, type Run } from "./report";

export const scenarioKeys = ["sellingPrice", "purchaseCost", "logistics", "advertising", "platformFeeRate", "fxRate"] as const;
export const scenarioValuesSchema = z.object({
  sellingPrice: researchInputSchema.shape.sellingPrice,
  purchaseCost: researchInputSchema.shape.purchaseCost,
  logistics: researchInputSchema.shape.logistics,
  advertising: researchInputSchema.shape.advertising,
  platformFeeRate: researchInputSchema.shape.platformFeeRate,
  fxRate: researchInputSchema.shape.fxRate,
}).strict();
export const scenarioSchema = z.object({
  id: z.uuid(), name: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(500), values: scenarioValuesSchema,
}).strict();
export const saveScenarioSchema = scenarioSchema.extend({ expectedUpdatedAt: z.iso.datetime() }).strict();
export const deleteScenarioSchema = z.object({ id: z.uuid(), expectedUpdatedAt: z.iso.datetime() }).strict();
export type Scenario = z.infer<typeof scenarioSchema>;
export function scenarioValues(input: ResearchInput) {
  return scenarioValuesSchema.parse(Object.fromEntries(scenarioKeys.map(key => [key, input[key]])));
}
export function scenarioSnapshot(input: ResearchInput, scenario: Scenario) {
  return buildSnapshot(researchInputSchema.parse({ ...input, ...scenario.values }));
}
export function saveScenario(run: Run, raw: unknown) {
  const scenario = scenarioSchema.parse(raw);
  // Revalidate the merged model, including the cross-currency FX requirement.
  scenarioSnapshot(run.input, scenario);
  const existing = run.scenarios ?? [];
  if (!existing.some(item => item.id === scenario.id) && existing.length >= 5) throw new Error("SCENARIO_LIMIT");
  return [...existing.filter(item => item.id !== scenario.id), scenario];
}
export function nextUpdatedAt(previous: string) {
  return new Date(Math.max(Date.now(), Date.parse(previous) + 1)).toISOString();
}
