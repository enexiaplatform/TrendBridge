import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { providerStatuses } from "@/lib/providers";
import { createClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function Admin(){
  if(isSupabaseServerConfigured()){const client=await createClient();const {data:{user}}=await client.auth.getUser();if(user?.app_metadata?.role!=="admin")notFound();}
  else if(process.env.NODE_ENV==="production")notFound();
  const providers=providerStatuses();return <AppShell breadcrumb="Operations"><div className="page"><div className="page-title"><div><h1>Research operations</h1><p>Provider readiness and the current launch boundary.</p></div><Link className="btn btn-outline" href="/design-system">Design system</Link></div><section className="panel panel-pad"><h2>Providers</h2>{providers.map(p=><div className="history-row" key={p.id}><div><strong>{p.label}</strong><p>{p.reason}</p></div><span className="data-tag tag-unavailable">{p.configured?"Configured":"Inactive"}</span></div>)}</section><section className="panel panel-pad" style={{marginTop:16}}><h2>Live launch checks</h2><p>Manus research, independent evidence review, global merchant onboarding and transactional fulfillment must pass before full reports go on sale.</p><p>Local snapshots use SQLite and private browser cookies. Production uses Supabase and requires the global validation migration. No production revenue or usage metrics are fabricated.</p></section></div></AppShell>;
}
