"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, FileSearch, LayoutDashboard, PlusCircle, Settings, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";
import { LanguageSwitch, useLocale } from "./locale";

const links = [
  { href: "/dashboard", label: "Workspace", vi: "Tổng quan", icon: LayoutDashboard },
  { href: "/research/new", label: "New research", vi: "Nghiên cứu mới", icon: PlusCircle },
  { href: "/reports", label: "My reports", vi: "Báo cáo", icon: FileSearch },
  { href: "/billing", label: "Plans & billing", vi: "Thanh toán", icon: CreditCard },
  { href: "/admin", label: "Operations", vi: "Vận hành", icon: ShieldCheck },
  { href: "/settings", label: "Settings", vi: "Cài đặt", icon: Settings },
];

export function AppShell({ children, breadcrumb }: { children: React.ReactNode; breadcrumb: string }) {
  const path = usePathname();
  const {t}=useLocale();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/"><Brand inverse /></Link>
        <nav className="side-nav" aria-label={t("Application navigation","Điều hướng ứng dụng")}>
          {links.map(({ href, label, vi, icon: Icon }) => (
            <Link className={`side-link ${path === href ? "active" : ""}`} href={href} key={href} aria-label={t(label,vi)}>
              <Icon size={18} strokeWidth={1.8} /><span>{t(label,vi)}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={20}/><p>{t("Evidence before intelligence.","Bằng chứng trước kết luận.")}</p>
          <span>{t("Your assumptions, clearly separated from external findings.","Giả định của bạn được phân biệt với dữ liệu nghiên cứu.")}</span>
        </div>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumb">TrendBridge / {breadcrumb}</div>
          <div className="user-menu"><LanguageSwitch/><BarChart3 size={16} color="#0aa9c9" /><div className="avatar">TB</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}
