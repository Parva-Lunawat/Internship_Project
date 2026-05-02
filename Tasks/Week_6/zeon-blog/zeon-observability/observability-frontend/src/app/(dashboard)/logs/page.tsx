"use client";

import { useCallback, useEffect, useState } from "react";

import { DataTable } from "@/src/components/DataTable";
import { fetchObservability } from "@/src/lib/api";
import { OBS_POLL_INTERVAL_MS } from "@/src/lib/config";
import { usePolling } from "@/src/lib/usePolling";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";
import { toast } from "react-toastify";

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

type LogsResponse = {
  data: LogRow[];
  meta: { total: number; page: number; limit: number };
};

export default function LogsPage() {
  const { ready, token } = useRequireAdmin();
  const [level, setLevel] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [requestId, setRequestId] = useState("");
  const [traceId, setTraceId] = useState("");

  const loader = useCallback(async () => {
    if (!token) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } } as LogsResponse;
    }
    const params = new URLSearchParams({
      page: "1",
      limit: "30",
    });
    if (level) params.set("level", level);
    if (endpoint) params.set("endpoint", endpoint);
    if (requestId) params.set("requestId", requestId);
    if (traceId) params.set("traceId", traceId);

    return fetchObservability<LogsResponse>(token, `/logs?${params.toString()}`);
  }, [endpoint, level, requestId, token, traceId]);

  const { data, isLoading, error } = usePolling(
    ready,
    OBS_POLL_INTERVAL_MS,
    loader,
  );
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Structured Logs</h2>
      <div className="obs-filters">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">all levels</option>
          <option value="debug">debug</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <input
          placeholder="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
        <input
          placeholder="requestId"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
        />
        <input
          placeholder="traceId"
          value={traceId}
          onChange={(e) => setTraceId(e.target.value)}
        />
      </div>

      {isLoading ? <p className="obs-muted">Refreshing logs...</p> : null}

      <DataTable
        rows={data?.data ?? []}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => r.timestamp },
          { key: "lvl", label: "Level", render: (r) => r.logLevel },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "status", label: "Status", render: (r) => r.statusCode ?? "-" },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId ?? "-" },
          {
            key: "msg",
            label: "Message",
            render: (r) =>
              r.message ||
              (r.payload ? JSON.stringify(r.payload).slice(0, 120) : "-"),
          },
        ]}
      />
      <p className="obs-muted" style={{ marginBottom: 0 }}>
        Total rows: {data?.meta.total ?? 0}
      </p>
    </section>
  );
}
