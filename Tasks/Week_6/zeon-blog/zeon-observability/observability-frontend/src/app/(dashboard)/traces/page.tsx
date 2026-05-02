"use client";

import { useState } from "react";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type TraceRow = {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  latencyMs: number | null;
  requestId: string | null;
  traceId: string;
  payload: Record<string, unknown> | null;
};

type TracesResponse = { data: TraceRow[]; meta: { total: number; page: number; limit: number } };

export default function TracesPage() {
  const filters = useDashboardFilters();
  const [requestId, setRequestId] = useState("");
  const [traceId, setTraceId] = useState("");
  const { data, isLoading } = useObservabilityData<TracesResponse>(
    `/traces${filters.buildQuery({ page: 1, limit: 50, requestId, traceId })}`,
    { data: [], meta: { total: 0, page: 1, limit: 50 } },
  );

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Request Traces</h2>
      <div className="obs-filters">
        <input placeholder="requestId lookup" value={requestId} onChange={(e) => setRequestId(e.target.value)} />
        <input placeholder="traceId lookup" value={traceId} onChange={(e) => setTraceId(e.target.value)} />
      </div>
      {isLoading ? <p className="obs-muted">Refreshing traces...</p> : null}
      <DataTable
        rows={data.data}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => new Date(r.timestamp).toLocaleString() },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "status", label: "Status", render: (r) => r.statusCode ?? "-" },
          { key: "latency", label: "Latency", render: (r) => r.latencyMs == null ? "-" : `${r.latencyMs.toFixed(1)}ms` },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId },
        ]}
      />
    </section>
  );
}
