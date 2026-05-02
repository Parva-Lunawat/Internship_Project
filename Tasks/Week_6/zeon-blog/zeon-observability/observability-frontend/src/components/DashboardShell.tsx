"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearToken } from "@/src/lib/auth";

const NAV_ITEMS = [
  { href: "/metrics", label: "Metrics" },
  { href: "/logs", label: "Logs" },
  { href: "/events", label: "Events" },
  { href: "/traces", label: "Traces" },
  { href: "/correlation", label: "Correlation" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="obs-shell">
      <aside className="obs-nav">
        <h1>Zeon MELT</h1>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={
                isActive
                  ? {
                      borderColor: "var(--line)",
                      color: "var(--text)",
                      background: "var(--panel-soft)",
                    }
                  : undefined
              }
            >
              {item.label}
            </Link>
          );
        })}

        <button
          className="obs-btn secondary"
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
          style={{ marginTop: 16, width: "100%" }}
        >
          Logout
        </button>
      </aside>
      <main className="obs-main">{children}</main>
    </div>
  );
}
