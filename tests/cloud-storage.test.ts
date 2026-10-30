import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "@/lib/launch/model";
import { sampleRun } from "@/lib/research/sample";
import { illustrativeStrategy } from "@/lib/strategy/sample";

// Explicit opt-in: creates two anonymous QA accounts/cases on the given HTTPS deployment.
// Never reuse a real user's cookies. Supabase SSR may issue multiple/chunked cookies.
const origin = process.env.TB_CLOUD_ORIGIN;
function session() {
  const jar = new Map<string, string>();
  return async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Origin", origin!);
    if (jar.size) headers.set("Cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const response = await fetch(`${origin}${path}`, { ...init, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";", 1)[0], split = pair.indexOf("=");
      const name = pair.slice(0, split), value = pair.slice(split + 1);
      if (/max-age=0(?:;|$)/i.test(cookie)) jar.delete(name); else jar.set(name, value);
    }
    return response;
  };
}

describe.skipIf(!origin)("cloud research storage with real Auth sessions", () => {
  it("persists private workspaces, rejects cross-owner/stale writes and preserves paid locks", async () => {
    expect(new URL(origin!).protocol).toBe("https:");
    const first = session(), second = session();
    expect((await first("/api/opportunities")).status).toBe(401);
    const input = { ...sampleRun().input, name: `[QA cloud] Persistence ${Date.now()}` };
    const key = crypto.randomUUID();
    const create = (send: ReturnType<typeof session>, requestKey = crypto.randomUUID()) => send("/api/research", {
      method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey }, body: JSON.stringify(input),
    });
    const created = await create(first, key);
    expect(created.status).toBe(201);
    let run = await created.json();
    const retry = await create(first, key);
    expect(retry.status).toBe(201); expect((await retry.json()).id).toBe(run.id);
    const other = await create(second); expect(other.status).toBe(201);
    const otherRun = await other.json();
    expect(otherRun.id).not.toBe(run.id);
    const path = `/api/research/${run.id}`;
    expect((await second(path)).status).toBe(404);
    const { revision: _r, decisions: _d, planVersions: _p, ...workspace } = emptyWorkspace();
    workspace.project = "Cloud persistence QA"; workspace.stage = "validating";
    workspace.strategy = illustrativeStrategy();
    workspace.blocks[0].content = "QA only: validate persistence before activating external research.";
    const body = { expectedUpdatedAt: run.updatedAt, workspace };
    const put = (send: ReturnType<typeof session>, value = body) => send(`${path}/workspace`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
    });
    expect((await put(second)).status).toBe(404);
    const saved = await put(first); expect(saved.status).toBe(200); run = await saved.json();
    expect(run.workspace.revision).toBe(1); expect(run.access).toBe("preview"); expect(run.report).toBeNull();
    expect(run.workspace.strategy.channels).toHaveLength(2);
    expect((await put(first)).status).toBe(409);
    const reload = await first(path); expect(reload.status).toBe(200);
    expect((await reload.json()).workspace).toEqual(run.workspace);
    const list = await first("/api/opportunities"); expect(list.status).toBe(200);
    expect((await list.json()).opportunities).toEqual(expect.arrayContaining([expect.objectContaining({ id: run.id, project: "Cloud persistence QA" })]));
    const html = await first(`${path}/launch-export?format=html`); expect(html.status).toBe(200);
    expect(await html.text()).toContain("QA only: validate persistence");
    const brief = await first(`${path}/launch-export?format=strategy`); expect(brief.status).toBe(200);
    expect(await brief.text()).toContain("Market Intelligence &amp; GTM Brief");
    const xlsx = await first(`${path}/launch-export?format=xlsx`); expect(xlsx.status).toBe(200);
    expect([...new Uint8Array(await xlsx.arrayBuffer()).slice(0, 2)]).toEqual([80, 75]);
    expect((await second(`${path}/launch-export?format=html`)).status).toBe(404);
    expect((await first(`${path}/export?format=xlsx`)).status).toBe(403);
    const capability = await (await first("/api/capabilities")).json();
    expect(capability.research.live).toBe(false); expect(capability.commerce.paidUnlock).toBe(false);
    // IDs only, to support scoped cleanup; never print Auth tokens or cookies.
    console.info("Cloud QA case IDs", run.id, otherRun.id);
  }, 90_000);
});
