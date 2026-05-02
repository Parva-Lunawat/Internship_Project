"use client";

import { useState } from "react";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type LogRow = {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  logLevel: string;
  requestId: string | null;
  traceId: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
};

type LogsResponse = { data: LogRow[]; meta: { total: number; page: number; limit: number } };

export default function LogsPage() {
  const filters = useDashboardFilters();
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useObservabilityData<LogsResponse>(
    `/logs${filters.buildQuery({ page: 1, limit: 50, level, search })}`,
    { data: [], meta: { total: 0, page: 1, limit: 50 } },
  );

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Structured Logs</h2>
      <div className="obs-filters">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">all severities</option>
          <option value="debug">debug</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <input placeholder="search messages" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {isLoading ? <p className="obs-muted">Refreshing logs without replacing the table...</p> : null}
      <DataTable
        rows={data.data}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => new Date(r.timestamp).toLocaleString() },
          { key: "lvl", label: "Level", render: (r) => r.logLevel },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "status", label: "Status", render: (r) => r.statusCode ?? "-" },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId ?? "-" },
          { key: "msg", label: "Message", render: (r) => r.message || (r.payload ? JSON.stringify(r.payload).slice(0, 120) : "-") },
        ]}
      />
      <p className="obs-muted">Total rows: {data.meta.total}</p>
    </section>
  );
}
