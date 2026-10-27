"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, FileSearch, LayoutDashboard, PlusCircle, Settings, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";

const links = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/research/new", label: "Nghiên cứu mới", icon: PlusCircle },
  { href: "/reports/demo", label: "Báo cáo", icon: FileSearch },
  { href: "/billing", label: "Tín dụng & thanh toán", icon: CreditCard },
  { href: "/admin", label: "Quản trị", icon: ShieldCheck },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function AppShell({ children, breadcrumb }: { children: React.ReactNode; breadcrumb: string }) {
  const path = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/"><Brand inverse /></Link>
        <nav className="side-nav" aria-label="Điều hướng ứng dụng">
          {links.map(({ href, label, icon: Icon }) => (
            <Link className={`side-link ${path === href ? "active" : ""}`} href={href} key={href} aria-label={label}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tín dụng còn lại</span><strong>2</strong></div>
          <div className="credit-meter"><i /></div>
          <span>Credit phát triển minh họa — không phải số dư thanh toán thật.</span>
        </div>
      </aside>
      <main className="app-main">
        <header className="topbar">
          <div className="breadcrumb">TrendBridge / {breadcrumb}</div>
          <div className="user-menu"><BarChart3 size={16} color="#0aa9c9" /><span>Chế độ phát triển</span><div className="avatar">TB</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}
