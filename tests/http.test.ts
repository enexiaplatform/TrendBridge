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
    const freeId=crypto.randomUUID();const freeValues={sellingPrice:29,purchaseCost:9,logistics:4,advertising:12,platformFeeRate:.15,fxRate:null};
    const freeSaved=await fetch(`${origin}/api/research/${run.id}/scenarios`,{method:"POST",headers:{Cookie:cookie,Origin:origin!,"Content-Type":"application/json"},body:JSON.stringify({id:freeId,name:"Free preview scenario",notes:"Free tool test",values:freeValues,expectedUpdatedAt:run.updatedAt})});
    expect(freeSaved.status).toBe(200);const freeRun=await freeSaved.json();expect(freeRun.access).toBe("preview");expect(freeRun.report).toBeNull();expect(freeRun.scenarios).toHaveLength(1);
    const freeRemoved=await fetch(`${origin}/api/research/${run.id}/scenarios`,{method:"DELETE",headers:{Cookie:cookie,Origin:origin!},body:JSON.stringify({id:freeId,expectedUpdatedAt:freeRun.updatedAt})});expect(freeRemoved.status).toBe(200);
    const locked=await fetch(`${origin}/api/research/${run.id}/export?format=xlsx`,{headers:{Cookie:cookie}});expect(locked.status).toBe(403);
    const unlock=await fetch(`${origin}/api/research/${run.id}/unlock`,{method:"POST",headers:{Cookie:cookie,Origin:origin!}});expect(unlock.status).toBe(200);const full=await unlock.json();expect(full.provider).toBe("fixture");
    const scenarioId=crypto.randomUUID();const endpoint=`${origin}/api/research/${run.id}/scenarios`;
    const scenario={id:scenarioId,name:"Higher acquisition cost",notes:"HTTP test",values:{sellingPrice:29,purchaseCost:9,logistics:4,advertising:12,platformFeeRate:.15,fxRate:null},expectedUpdatedAt:full.updatedAt};
    const post=(body:unknown,ownerCookie=cookie)=>fetch(endpoint,{method:"POST",headers:{Cookie:ownerCookie,Origin:origin!,"Content-Type":"application/json"},body:JSON.stringify(body)});
    expect((await post(scenario,otherCookie)).status).toBe(404);
    expect((await post({...scenario,values:{...scenario.values,platformFeeRate:1}})).status).toBe(400);
    const writes=await Promise.all([post(scenario),post({...scenario,id:crypto.randomUUID()})]);
    expect(writes.map(r=>r.status).sort()).toEqual([200,409]);
    const saved=await writes.find(r=>r.status===200)!.json();expect(saved.scenarios).toHaveLength(1);expect(saved.access).toBe("fixture");
    const restored=await fetch(`${origin}/api/research/${run.id}`,{headers:{Cookie:cookie}});expect((await restored.json()).scenarios).toEqual(saved.scenarios);
    const printable=await fetch(`${origin}/api/research/${run.id}/export?format=html`,{headers:{Cookie:cookie}});expect(await printable.text()).toContain("-$0.35");
    const badOrigin=await fetch(endpoint,{method:"POST",headers:{Cookie:cookie,Origin:"https://untrusted.invalid"},body:JSON.stringify(scenario)});expect(badOrigin.status).toBe(403);
    const deleted=await fetch(endpoint,{method:"DELETE",headers:{Cookie:cookie,Origin:origin!},body:JSON.stringify({id:saved.scenarios[0].id,expectedUpdatedAt:saved.updatedAt})});expect(deleted.status).toBe(200);expect((await deleted.json()).scenarios).toEqual([]);
    const exportFile=await fetch(`${origin}/api/research/${run.id}/export?format=xlsx`,{headers:{Cookie:cookie}});expect(exportFile.status).toBe(200);expect(new Uint8Array(await exportFile.arrayBuffer()).slice(0,2)).toEqual(new Uint8Array([80,75]));
    const history=await fetch(`${origin}/api/research`,{headers:{Cookie:cookie}});expect((await history.json()).runs.some((r:{id:string})=>r.id===run.id)).toBe(true);
  },30_000);
  it("rejects malformed and cross-origin requests",async()=>{
    const bad=await fetch(`${origin}/api/research`,{method:"POST",headers:{"Content-Type":"application/json"},body:"broken"});expect(bad.status).toBe(400);
    const cross=await fetch(`${origin}/api/research`,{method:"POST",headers:{Origin:"https://untrusted.invalid"},body:"{}"});expect(cross.status).toBe(403);
  });
});
