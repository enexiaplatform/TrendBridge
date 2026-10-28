import { describe, expect, it } from "vitest";
import { sampleRun } from "@/lib/research/sample";
const origin=process.env.TB_HTTP_ORIGIN;
describe.skipIf(!origin)("research HTTP integration (requires local dev server)",()=>{
  it("creates, reloads, isolates, locks and test-unlocks a persisted report",async()=>{
    const input={...sampleRun().input,name:`HTTP integration ${crypto.randomUUID()}`};
    const headers={"Content-Type":"application/json","Idempotency-Key":crypto.randomUUID(),Origin:origin!};
    const created=await fetch(`${origin}/api/research`,{method:"POST",headers,body:JSON.stringify(input)});
    expect(created.status).toBe(201);const cookie=created.headers.get("set-cookie")!.split(";")[0];const run=await created.json();expect(run.report).toBeNull();expect(run.input.market).toBe("US");
    const get=await fetch(`${origin}/api/research/${run.id}`,{headers:{Cookie:cookie}});expect(get.status).toBe(200);expect((await get.json()).input.name).toBe(input.name);
    const repeat=await fetch(`${origin}/api/research`,{method:"POST",headers:{...headers,Cookie:cookie},body:JSON.stringify(input)});expect((await repeat.json()).id).toBe(run.id);
    const other=await fetch(`${origin}/api/research`,{method:"POST",headers:{...headers,"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(input)});const otherCookie=other.headers.get("set-cookie")!.split(";")[0];
    const denied=await fetch(`${origin}/api/research/${run.id}`,{headers:{Cookie:otherCookie}});expect(denied.status).toBe(404);
    const locked=await fetch(`${origin}/api/research/${run.id}/export?format=xlsx`,{headers:{Cookie:cookie}});expect(locked.status).toBe(403);
    const unlock=await fetch(`${origin}/api/research/${run.id}/unlock`,{method:"POST",headers:{Cookie:cookie,Origin:origin!}});expect(unlock.status).toBe(200);expect((await unlock.json()).provider).toBe("fixture");
    const exportFile=await fetch(`${origin}/api/research/${run.id}/export?format=xlsx`,{headers:{Cookie:cookie}});expect(exportFile.status).toBe(200);expect(new Uint8Array(await exportFile.arrayBuffer()).slice(0,2)).toEqual(new Uint8Array([80,75]));
    const history=await fetch(`${origin}/api/research`,{headers:{Cookie:cookie}});expect((await history.json()).runs.some((r:{id:string})=>r.id===run.id)).toBe(true);
  },30_000);
  it("rejects malformed and cross-origin requests",async()=>{
    const bad=await fetch(`${origin}/api/research`,{method:"POST",headers:{"Content-Type":"application/json"},body:"broken"});expect(bad.status).toBe(400);
    const cross=await fetch(`${origin}/api/research`,{method:"POST",headers:{Origin:"https://untrusted.invalid"},body:"{}"});expect(cross.status).toBe(403);
  });
});
