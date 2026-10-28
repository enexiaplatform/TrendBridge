import { cookies } from "next/headers";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { localResearchStore } from "./store";
import type { Run } from "./report";

export class ResearchError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function researchContext(createGuest = false) {
  if (!isSupabaseServerConfigured()) {
    if (process.env.NODE_ENV === "production") throw new ResearchError(503, "Research storage is not configured. Please try again later.");
    const jar = await cookies(); let owner = jar.get("tb_guest")?.value;
    if (!owner?.match(/^[a-f0-9]{64}$/)) {
      if (!createGuest) throw new ResearchError(401, "Start a free snapshot to create a private workspace.");
      const { randomBytes } = await import("node:crypto"); owner = randomBytes(32).toString("hex");
      jar.set("tb_guest", owner, { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    const store = localResearchStore();
    return { owner, testUnlock: true, get: async (id: string) => store.get(owner!, id), list: async () => store.list(owner!), create: async (run: Run) => store.create(run), save: async (run: Run) => { store.save(run); } };
  }
  const client = await createClient(); let { data: { user } } = await client.auth.getUser();
  if (!user && createGuest) { const result = await client.auth.signInAnonymously(); if (result.error) throw new ResearchError(401, "Sign in to save your research. Guest access is not enabled on this deployment."); user = result.data.user; }
  if (!user) throw new ResearchError(401, "Please sign in to access your research.");
  const secret = process.env.SUPABASE_SECRET_KEY; if (!secret) throw new ResearchError(503, "Research storage is not configured.");
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, { auth: { persistSession: false, autoRefreshToken: false } }); const owner = user.id;
  return {
    owner, testUnlock: false,
    async get(id: string): Promise<Run | null> { const { data, error } = await admin.from("validation_runs").select("document").eq("owner_id",owner).eq("id",id).maybeSingle(); if(error) throw new ResearchError(503,"Research is temporarily unavailable."); return data?.document ?? null; },
    async list(): Promise<Run[]> { const { data, error } = await admin.from("validation_runs").select("document").eq("owner_id",owner).order("created_at",{ascending:false}).limit(100); if(error) throw new ResearchError(503,"Research history is temporarily unavailable."); return (data ?? []).map(r=>r.document); },
    async create(run: Run): Promise<Run> { const { data, error } = await admin.rpc("create_validation_run", { p_id:run.id, p_owner:owner, p_key:run.requestKey, p_document:run }); if(error) { if(error.message.includes("RATE_LIMIT")) throw new ResearchError(429,"Free snapshot limit reached. Try again later."); throw new ResearchError(503,"Could not save the snapshot."); } return data as Run; },
    async save(run: Run) { const { error } = await admin.from("validation_runs").update({ document:run,updated_at:run.updatedAt }).eq("owner_id",owner).eq("id",run.id); if(error) throw new ResearchError(503,"Could not save the report."); },
  };
}
export function requireSameOrigin(request: Request) { const origin = request.headers.get("origin"); if (origin && origin !== new URL(request.url).origin) throw new ResearchError(403, "Cross-origin request rejected."); }
export function apiError(error: unknown) {
  if (error instanceof ResearchError) return Response.json({ error:error.message },{status:error.status});
  if(error instanceof Error && error.message === "RATE_LIMIT") return Response.json({error:"Free snapshot limit reached. Try again later."},{status:429});
  console.error("Research request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({error:"Could not complete this request. Please try again."},{status:500});
}
