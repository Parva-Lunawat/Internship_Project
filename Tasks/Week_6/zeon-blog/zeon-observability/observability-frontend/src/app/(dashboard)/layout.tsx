"use client";

import { DashboardShell } from "@/src/components/DashboardShell";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAdmin();

  if (!ready) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p className="obs-muted">Verifying admin session...</p>
      </main>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
