"use client";

import Link from "next/link";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type Issue = {
  fingerprint: string;
  title: string;
  status: string;
  occurrenceCount: number;
  endpoint: string;
  statusCode: number | null;
  errorCategory: string;
  firstSeen: string;
  lastSeen: string;
  affectedEndpoints: string[];
};

type IssuesResponse = { data: Issue[]; meta: { total: number; page: number; limit: number } };

export default function IssuesPage() {
  const filters = useDashboardFilters();
  const { data, isLoading } = useObservabilityData<IssuesResponse>(
    `/issues${filters.buildQuery({ page: 1, limit: 50 })}`,
    { data: [], meta: { total: 0, page: 1, limit: 50 } },
  );

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Grouped Issues</h2>
      <p className="obs-muted">Sentry-style grouping by endpoint, status code, error category, and normalized message.{isLoading ? " Refreshing..." : ""}</p>
      <DataTable
        rows={data.data}
        columns={[
          { key: "title", label: "Issue", render: (r) => <Link href={`/issues/${encodeURIComponent(r.fingerprint)}`}><strong>{r.title}</strong></Link> },
          { key: "count", label: "Occurrences", render: (r) => r.occurrenceCount },
          { key: "seen", label: "First / Last Seen", render: (r) => `${new Date(r.firstSeen).toLocaleString()} / ${new Date(r.lastSeen).toLocaleString()}` },
          { key: "ep", label: "Affected Endpoint", render: (r) => r.endpoint },
          { key: "status", label: "Status", render: (r) => r.status },
          { key: "cat", label: "Category", render: (r) => r.errorCategory },
        ]}
      />
    </section>
  );
}
