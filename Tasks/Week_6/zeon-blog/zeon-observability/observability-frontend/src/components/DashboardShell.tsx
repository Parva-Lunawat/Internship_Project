"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  DashboardFilterProvider,
  GlobalFilterBar,
} from "@/src/components/DashboardFilters";
import { useTheme } from "@/src/components/ThemeProvider";
import { clearToken } from "@/src/lib/auth";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview" },
  { href: "/metrics", label: "Metrics" },
  { href: "/logs", label: "Logs" },
  { href: "/events", label: "Events" },
  { href: "/traces", label: "Traces" },
  { href: "/issues", label: "Issues" },
  { href: "/correlation", label: "Correlation" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardFilterProvider>
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
            onClick={toggleTheme}
            style={{ marginTop: 16, width: "100%" }}
          >
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>

          <button
            className="obs-btn secondary"
            onClick={() => {
              clearToken();
              router.replace("/login");
            }}
            style={{ marginTop: 8, width: "100%" }}
          >
            Logout
          </button>
        </aside>
        <main className="obs-main">
          <GlobalFilterBar />
          {children}
        </main>
      </div>
    </DashboardFilterProvider>
  );
}
