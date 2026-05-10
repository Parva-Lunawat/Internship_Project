"use client";

import { useParams } from "next/navigation";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type Detail = {
  title: string;
  status: string;
  totalOccurrences: number;
  affectedEndpoints: string[];
  firstSeen: string;
  lastSeen: string;
  latestRequest: null | { requestId: string | null; endpoint: string; method: string; statusCode: number; latencyMs: number };
  requestSamples: Array<{ requestId: string | null; endpoint: string; method: string; statusCode: number; latencyMs: number; timestamp: string }>;
  relatedLogs: Array<{ timestamp: string; logLevel: string; message: string | null }>;
  relatedTraces: Array<{ timestamp: string; traceId: string; latencyMs: number | null }>;
  relatedEvents: Array<{ timestamp: string; eventType: string }>;
  errorContext: Record<string, unknown>;
};

export default function IssueDetailPage() {
  const params = useParams<{ fingerprint: string }>();
  const filters = useDashboardFilters();
  const fingerprint = decodeURIComponent(params.fingerprint);
  const { data, isLoading } = useObservabilityData<{ data: Detail }>(
    `/issues/${encodeURIComponent(fingerprint)}${filters.buildQuery()}`,
    { data: { title: "", status: "unresolved", totalOccurrences: 0, affectedEndpoints: [], firstSeen: "", lastSeen: "", latestRequest: null, requestSamples: [], relatedLogs: [], relatedTraces: [], relatedEvents: [], errorContext: {} } },
  );
  const detail = data.data;

  return (
    <section>
      <div className="obs-card">
        <h2 style={{ marginTop: 0 }}>{detail.title || "Issue Detail"}</h2>
        <p className="obs-muted">{detail.status} · {detail.totalOccurrences} occurrences · {isLoading ? "refreshing" : "stable"}</p>
        <p>Affected endpoints: {detail.affectedEndpoints.join(", ") || "-"}</p>
      </div>
      <div className="obs-grid-2">
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>Request Samples</h3>
          <DataTable rows={detail.requestSamples} columns={[
            { key: "ts", label: "Time", render: (r) => new Date(r.timestamp).toLocaleString() },
            { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
            { key: "status", label: "Status", render: (r) => r.statusCode },
            { key: "lat", label: "Latency", render: (r) => `${r.latencyMs.toFixed(1)}ms` },
            { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          ]} />
        </div>
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>Error Context</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(detail.errorContext, null, 2)}</pre>
        </div>
      </div>
      <div className="obs-grid-2">
        <div className="obs-card"><h3>Related Logs</h3><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(detail.relatedLogs.slice(0, 10), null, 2)}</pre></div>
        <div className="obs-card"><h3>Related Traces / Events</h3><pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify({ traces: detail.relatedTraces.slice(0, 10), events: detail.relatedEvents.slice(0, 10) }, null, 2)}</pre></div>
      </div>
    </section>
  );
}
