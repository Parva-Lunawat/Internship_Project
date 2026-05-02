"use client";

import { useCallback, useEffect, useState } from "react";

import { DataTable } from "@/src/components/DataTable";
import { fetchObservability } from "@/src/lib/api";
import { OBS_POLL_INTERVAL_MS } from "@/src/lib/config";
import { usePolling } from "@/src/lib/usePolling";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";
import { toast } from "react-toastify";

type MetricAggregateRow = {
  bucket: string;
  count: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  errorCount: number;
};

export default function MetricsPage() {
  const { ready, token } = useRequireAdmin();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("");
  const [groupBy, setGroupBy] = useState("hour");

  const loader = useCallback(async () => {
    if (!token) return { data: [] as MetricAggregateRow[] };
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    if (endpoint) params.set("endpoint", endpoint);
    if (method) params.set("method", method);
    params.set("groupBy", groupBy);

    return fetchObservability<{ data: MetricAggregateRow[] }>(
      token,
      `/metrics/aggregate?${params.toString()}`,
    );
  }, [endpoint, from, groupBy, method, to, token]);

  const { data, isLoading, error } = usePolling(
    ready,
    OBS_POLL_INTERVAL_MS,
    loader,
  );
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  const rows = data?.data ?? [];

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Latency + Throughput Metrics</h2>
      <p className="obs-muted">
        Polling every {OBS_POLL_INTERVAL_MS / 1000}s. Group and filter to inspect
        performance trends.
      </p>

      <div className="obs-filters">
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          placeholder="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">all methods</option>
          <option>GET</option>
          <option>POST</option>
          <option>PATCH</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="minute">minute</option>
          <option value="hour">hour</option>
          <option value="day">day</option>
        </select>
      </div>

      {isLoading ? <p className="obs-muted">Refreshing metrics...</p> : null}

      <DataTable
        rows={rows}
        columns={[
          { key: "bucket", label: "Bucket", render: (r) => r.bucket },
          { key: "count", label: "Req", render: (r) => r.count },
          {
            key: "avg",
            label: "Avg ms",
            render: (r) => r.avgLatencyMs.toFixed(2),
          },
          {
            key: "min",
            label: "Min ms",
            render: (r) => r.minLatencyMs.toFixed(2),
          },
          {
            key: "max",
            label: "Max ms",
            render: (r) => r.maxLatencyMs.toFixed(2),
          },
          { key: "err", label: "Errors", render: (r) => r.errorCount },
        ]}
      />
    </section>
  );
}
