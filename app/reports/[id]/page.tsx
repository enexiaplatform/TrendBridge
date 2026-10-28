import { AppShell } from "@/components/app-shell";
import { ValidationReport } from "@/components/validation-report";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <AppShell breadcrumb="Product validation"><ValidationReport id={id}/></AppShell>;}
