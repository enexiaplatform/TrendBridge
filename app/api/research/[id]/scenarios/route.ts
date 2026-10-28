import { ZodError } from "zod";
import { publicRun } from "@/lib/research/report";
import { saveScenarioSchema, deleteScenarioSchema, saveScenario, nextUpdatedAt } from "@/lib/research/scenarios";
import { apiError, researchContext, requireSameOrigin, ResearchError } from "@/lib/research/server";

async function mutate(request: Request, params: Promise<{ id: string }>, remove: boolean) {
  try {
    requireSameOrigin(request);
    const text = await request.text();
    if (text.length > 8000) throw new ResearchError(413, "Scenario is too large.");
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { throw new ResearchError(400, "Invalid scenario data."); }
    const data = (remove ? deleteScenarioSchema : saveScenarioSchema).parse(raw);
    const { id } = await params;
    const context = await researchContext();
    const run = await context.get(id);
    if (!run) throw new ResearchError(404, "Research not found.");
    if (run.updatedAt !== data.expectedUpdatedAt) throw new ResearchError(409, "This report changed in another window. Reload before saving again.");
    if (remove) run.scenarios = (run.scenarios ?? []).filter(s => s.id !== data.id);
    else {
      const { expectedUpdatedAt: _, ...scenario } = saveScenarioSchema.parse(raw);
      run.scenarios = saveScenario(run, scenario);
    }
    run.updatedAt = nextUpdatedAt(data.expectedUpdatedAt);
    await context.save(run, data.expectedUpdatedAt);
    return Response.json(publicRun(run), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Check scenario values. Use nonnegative amounts, a fee below 100%, and FX for cross-currency costs." }, { status: 400 });
    if (error instanceof Error && error.message === "SCENARIO_LIMIT") return Response.json({ error: "Keep up to five scenarios per report. Edit or remove one first." }, { status: 400 });
    return apiError(error);
  }
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { return mutate(request, params, false); }
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) { return mutate(request, params, true); }
