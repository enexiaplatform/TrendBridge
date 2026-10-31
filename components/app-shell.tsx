"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Search,
  Home,
  FolderOpen,
  Database,
  Settings,
} from "lucide-react";
import { Brand } from "./brand";
import { LanguageSwitch, useLocale } from "./locale";

export function AppShell({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb: string;
}) {
  const path = usePathname();
  const { t } = useLocale();
  const caseOpen = path.startsWith("/reports/");
  return (
    <div className={`workbench-shell ${caseOpen ? "precision-shell" : ""}`}>
      <a className="wb-skip" href="#workspace-content">
        {t("Skip to content", "Đến nội dung")}
      </a>
      {caseOpen && (
        <nav
          className="pd-rail"
          aria-label={t("Quick navigation", "Điều hướng nhanh")}
        >
          <Link
            href="/dashboard"
            className="pd-rail-brand"
            aria-label="TrendBridge"
          >
            <span className="brand-symbol" />
          </Link>
          {[
            ["/dashboard", Home, t("Workspace", "Workspace")],
            ["/reports", FolderOpen, t("Library", "Thư viện")],
            [
              "/research-collection",
              Database,
              t("Research collection", "Bộ dữ liệu"),
            ],
            ["/settings", Settings, t("Settings", "Cài đặt")],
          ].map(([href, Icon, label]) => {
            const RailIcon = Icon as typeof Home;
            return (
              <Link
                key={String(href)}
                href={String(href)}
                title={String(label)}
                aria-label={String(label)}
              >
                <RailIcon size={20} />
              </Link>
            );
          })}
        </nav>
      )}
      <header className="wb-header">
        <Link href="/dashboard" aria-label="TrendBridge">
          <Brand />
        </Link>
        <nav
          aria-label={t("Workspace navigation", "Điều hướng workspace")}
          className="wb-navigation"
        >
          <Link
            href="/dashboard"
            aria-current={
              path === "/dashboard" ||
              path.startsWith("/reports/") ||
              path.startsWith("/research/")
                ? "page"
                : undefined
            }
          >
            {t("Workspace", "Workspace")}
          </Link>
          <Link
            href="/reports"
            aria-current={path === "/reports" ? "page" : undefined}
          >
            {t("Library", "Thư viện")}
          </Link>
        </nav>
        <form
          action="/reports"
          method="get"
          role="search"
          className="wb-search"
        >
          <Search size={17} />
          <input
            name="q"
            aria-label={t("Search your research", "Tìm nghiên cứu của bạn")}
            placeholder={t("Search your products…", "Tìm sản phẩm của bạn…")}
            maxLength={160}
          />
        </form>
        <div className="wb-header-tools">
          <LanguageSwitch />
          <details className="wb-account">
            <summary aria-label={t("Account menu", "Menu tài khoản")}>
              <span>TB</span>
              <ChevronDown size={14} />
            </summary>
            <nav aria-label={t("Account", "Tài khoản")}>
              <Link href="/reports">
                {t("Research library", "Thư viện nghiên cứu")}
              </Link>
              <Link href="/research/new">
                {t("New research", "Nghiên cứu mới")}
              </Link>
              <Link href="/settings">{t("Settings", "Cài đặt")}</Link>
              <Link href="/billing">
                {t("Plans & billing", "Gói & thanh toán")}
              </Link>
              <Link href="/login">{t("Sign in", "Đăng nhập")}</Link>
            </nav>
          </details>
        </div>
      </header>
      <main id="workspace-content" tabIndex={-1} aria-label={breadcrumb}>
        {children}
      </main>
    </div>
  );
}
