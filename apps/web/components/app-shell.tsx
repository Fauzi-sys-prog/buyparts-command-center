"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { navigationItems } from "@/lib/navigation";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BP</div>
          <div>
            <p className="eyebrow">BuyParts.Online</p>
            <h1>Command Center</h1>
          </div>
        </div>

        <nav className="nav">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="nav-copy">
                  <strong>{item.label}</strong>
                  <span>{item.caption}</span>
                </div>
                {item.badge ? <small className="nav-badge">{item.badge}</small> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="eyebrow">Theme</span>
          <strong>Industrial Command Center</strong>
          <p>The brain behind every SKU.</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP foundation</p>
            <h2>Internal operations, pricing, inventory, and catalog intelligence</h2>
          </div>
          <div className="status-pill">Shopify-first build</div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
