"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { OperatorProfilePanel } from "@/components/operator-profile-panel";
import { navigationItems, navigationSections, type NavigationItem } from "@/lib/navigation";

function isItemActive(pathname: string, item: NavigationItem) {
  if (item.href === "/") {
    return pathname === "/";
  }

  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  if (item.href === "/modules/sku-intelligence" && pathname.startsWith("/sku/")) {
    return true;
  }

  if (item.href === "/modules/catalog-ai" && pathname.startsWith("/catalog/runs/")) {
    return true;
  }

  return false;
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const activeItem = navigationItems.find((item) => isItemActive(pathname, item)) ?? navigationItems[0];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand-block">
          <div className="brand-lockup">
            <div className="brand-mark">BP</div>
            <div>
              <p className="eyebrow brand-overline">BuyParts Online</p>
              <h1 className="brand-wordmark">
                <span>BUY</span>
                <span>PARTS</span>
              </h1>
            </div>
          </div>

          <div className="sidebar-system-label">
            <strong>DASHBOARD</strong>
            <strong>SYSTEM</strong>
          </div>
        </div>

        <div className="sidebar-search-shell">
          <label className="sidebar-search">
            <span className="sidebar-search-icon" aria-hidden="true" />
            <input type="search" placeholder="Search analytics" />
          </label>
        </div>

        <div className="sidebar-scroll">
          <nav className="nav-section-stack">
            {navigationSections.map((section) => {
              const sectionItems = navigationItems.filter((item) => item.section === section);

              return (
                <div key={section} className="sidebar-section">
                  <p className="sidebar-section-label">{section}</p>
                  <div className="nav">
                    {sectionItems.map((item) => {
                      const isActive = isItemActive(pathname, item);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-link${isActive ? " is-active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <div className="nav-glyph" aria-hidden="true">
                            {item.shortLabel}
                          </div>
                          <div className="nav-copy">
                            <div className="nav-item-main">
                              <strong>{item.navLabel ?? item.label}</strong>
                              <span className="nav-arrow" aria-hidden="true">
                                &gt;
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-operator-mini">
            <div className="sidebar-operator-avatar" aria-hidden="true">
              BP
            </div>
            <div>
              <strong>Local Operator</strong>
              <p>Internal workspace</p>
            </div>
          </div>
          <button type="button" className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-intro">
            <p className="eyebrow">System Operational Live</p>
            <h2>{activeItem.label}</h2>
            <p className="topbar-copy">{activeItem.caption}</p>
          </div>
          <div className="topbar-tools">
            <OperatorProfilePanel />
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
