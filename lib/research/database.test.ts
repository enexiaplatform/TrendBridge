import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
describe("Postgres migrations and privilege boundary",()=>{
  it("applies both schema versions and enforces service-only report storage",async()=>{
    const db=new PGlite();
    try{
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
      const initial=readFileSync("supabase/migrations/20261027140630_initial_trendbridge_schema.sql","utf8");
      // PostgreSQL ships gen_random_uuid natively; PGlite has no pgcrypto extension binary.
      await db.exec(initial.replace("create extension if not exists pgcrypto;",""));
      await db.exec(readFileSync("supabase/migrations/20261028132646_global_validation_reports.sql","utf8"));
      const access=await db.query<{raw:boolean;update:boolean;role:boolean;rpc:boolean;server:boolean}>(`SELECT has_table_privilege('authenticated','public.validation_runs','SELECT') AS raw, has_table_privilege('authenticated','public.orders','UPDATE') AS update, has_column_privilege('authenticated','public.profiles','role','UPDATE') AS role, has_function_privilege('authenticated','public.create_validation_run(uuid,uuid,text,jsonb)','EXECUTE') AS rpc, has_table_privilege('service_role','public.validation_runs','INSERT') AS server`);
      expect(access.rows[0]).toEqual({raw:false,update:false,role:false,rpc:false,server:true});
      await db.exec(`INSERT INTO auth.users(id) VALUES('11111111-1111-4111-8111-111111111111');`);
      const id="22222222-2222-4222-8222-222222222222";const owner="11111111-1111-4111-8111-111111111111";const document={id,ownerId:owner,entitlement:"preview"};
      await db.query("SELECT public.create_validation_run($1,$2,$3,$4)",[id,owner,"unique-request",document]);
      await db.query("SELECT public.create_validation_run($1,$2,$3,$4)",[id,owner,"unique-request",document]);
      expect((await db.query<{n:number}>("SELECT count(*)::int AS n FROM public.validation_runs")).rows[0].n).toBe(1);
      await db.exec("SET ROLE authenticated");
      await expect(db.query("SELECT document FROM public.validation_runs")).rejects.toThrow();
      await db.exec("RESET ROLE");
      expect((await db.query<{enabled:boolean}>("SELECT relrowsecurity AS enabled FROM pg_class WHERE oid='public.validation_runs'::regclass")).rows[0].enabled).toBe(true);
    }finally{await db.close();}
  },30_000);
});
