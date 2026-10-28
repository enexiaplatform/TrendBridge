BEGIN;
SELECT plan(9);
SELECT has_table('public','validation_runs','Global report storage exists');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid='public.validation_runs'::regclass),'Report RLS enabled');
SELECT ok(not has_table_privilege('anon','public.validation_runs','SELECT'),'Guests cannot bypass preview projection');
SELECT ok(not has_table_privilege('authenticated','public.validation_runs','SELECT'),'Customers cannot download locked raw documents');
SELECT ok(not has_table_privilege('authenticated','public.validation_runs','UPDATE'),'Customers cannot grant their own access');
SELECT ok(not has_table_privilege('authenticated','public.orders','UPDATE'),'Orders cannot be self-marked paid');
SELECT ok(not has_column_privilege('authenticated','public.profiles','role','UPDATE'),'Roles cannot be self-promoted');
SELECT ok(not has_function_privilege('authenticated','public.create_validation_run(uuid,uuid,text,jsonb)','EXECUTE'),'Creation RPC is server-only');
SELECT ok(has_function_privilege('service_role','public.create_validation_run(uuid,uuid,text,jsonb)','EXECUTE'),'Server may create snapshots');

SELECT * FROM finish();
ROLLBACK;
