import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("isolated research bootstrap", () => {
  it("preserves legacy tables and denies browser roles while supporting server-owned cases", async () => {
    const db = new PGlite();
    const owner = "11111111-1111-4111-8111-111111111111";
    const otherOwner = "33333333-3333-4333-8333-333333333333";
    const id = "22222222-2222-4222-8222-222222222222";
    const document = { id, ownerId: owner, entitlement: "preview", updatedAt: "2026-10-29T00:00:00.000Z" };
    try {
      await db.exec(`
        create role anon;
        create role authenticated;
        create role service_role bypassrls;
        create schema auth;
        create table auth.users(id uuid primary key);
        create table public.users(id integer primary key, marker text);
        insert into public.users values(7, 'legacy-unchanged');
        grant select on public.users to anon, authenticated;
        insert into auth.users values('${owner}'), ('${otherOwner}');
      `);
      await db.exec(readFileSync("supabase/bootstrap/isolated-research.sql", "utf8"));
      expect((await db.query("select * from public.users")).rows).toEqual([{ id: 7, marker: "legacy-unchanged" }]);
      const permissions = await db.query(`select
        has_table_privilege('anon','public.users','SELECT') as legacy_select,
        has_schema_privilege('anon','trendbridge','USAGE') as anon_schema,
        has_table_privilege('authenticated','trendbridge.validation_runs','SELECT') as client_read,
        has_table_privilege('authenticated','trendbridge.validation_runs','UPDATE') as client_write,
        has_function_privilege('authenticated','trendbridge.create_validation_run(uuid,uuid,text,jsonb)','EXECUTE') as client_rpc,
        has_function_privilege('service_role','trendbridge.create_validation_run(uuid,uuid,text,jsonb)','EXECUTE') as server_rpc,
        (select relrowsecurity from pg_class where oid='trendbridge.validation_runs'::regclass) as rls`);
      expect(permissions.rows[0]).toEqual({ legacy_select: true, anon_schema: false, client_read: false, client_write: false, client_rpc: false, server_rpc: true, rls: true });

      await db.exec("set role service_role");
      const create = "select trendbridge.create_validation_run($1,$2,$3,$4) as document";
      await db.query(create, [id, owner, "retry-key", document]);
      const retry = await db.query<{ document: typeof document }>(create, [id, owner, "retry-key", { ...document, entitlement: "paid" }]);
      expect(retry.rows[0].document).toEqual(document);
      expect((await db.query("select * from trendbridge.validation_runs where owner_id=$1", [otherOwner])).rows).toHaveLength(0);
      const revised = { ...document, updatedAt: "2026-10-29T00:00:01.000Z" };
      const save = "update trendbridge.validation_runs set document=$1 where id=$2 and owner_id=$3 and document->>'updatedAt'=$4 returning id";
      expect((await db.query(save, [revised, id, otherOwner, document.updatedAt])).rows).toHaveLength(0);
      expect((await db.query(save, [revised, id, owner, document.updatedAt])).rows).toHaveLength(1);
      expect((await db.query(save, [document, id, owner, document.updatedAt])).rows).toHaveLength(0);
      await expect(db.query(create, ["44444444-4444-4444-8444-444444444444", owner, "missing-owner", { id: "44444444-4444-4444-8444-444444444444" }])).rejects.toThrow();
      for (let n = 1; n < 10; n++) {
        const nextId = `22222222-2222-4222-8222-${String(n).padStart(12, "0")}`;
        await db.query(create, [nextId, owner, `request-${n}`, { ...document, id: nextId }]);
      }
      await expect(db.query(create, ["55555555-5555-4555-8555-555555555555", owner, "over-quota", document])).rejects.toThrow("RATE_LIMIT");
      // A retry remains available after the quota is reached.
      expect((await db.query<{ document: typeof document }>(create, [id, owner, "retry-key", document])).rows[0].document).toEqual(revised);
      await db.exec("reset role; set role authenticated");
      await expect(db.query("select * from trendbridge.validation_runs")).rejects.toThrow();
      await expect(db.query(create, [id, owner, "retry-key", document])).rejects.toThrow();
      await db.exec("reset role; set role anon");
      await expect(db.query("select * from trendbridge.validation_runs")).rejects.toThrow();
    } finally {
      await db.close();
    }
  }, 30_000);
});
