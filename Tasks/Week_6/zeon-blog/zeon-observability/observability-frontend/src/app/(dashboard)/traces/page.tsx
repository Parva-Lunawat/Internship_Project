"use client";

import { useCallback, useEffect, useState } from "react";

import { DataTable } from "@/src/components/DataTable";
import { fetchObservability } from "@/src/lib/api";
import { OBS_POLL_INTERVAL_MS } from "@/src/lib/config";
import { usePolling } from "@/src/lib/usePolling";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";
import { toast } from "react-toastify";

type TraceRow = {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  latencyMs: number | null;
  requestId: string | null;
  traceId: string;
};

type TracesResponse = {
  data: TraceRow[];
  meta: { total: number; page: number; limit: number };
};

export default function TracesPage() {
  const { ready, token } = useRequireAdmin();
  const [endpoint, setEndpoint] = useState("");
  const [requestId, setRequestId] = useState("");
  const [traceId, setTraceId] = useState("");

  const loader = useCallback(async () => {
    if (!token) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } } as TracesResponse;
    }
    const params = new URLSearchParams({
      page: "1",
      limit: "30",
    });
    if (endpoint) params.set("endpoint", endpoint);
    if (requestId) params.set("requestId", requestId);
    if (traceId) params.set("traceId", traceId);
    return fetchObservability<TracesResponse>(
      token,
      `/traces?${params.toString()}`,
    );
  }, [endpoint, requestId, token, traceId]);

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
      <h2 style={{ marginTop: 0 }}>Request Traces</h2>
      <div className="obs-filters">
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

      {isLoading ? <p className="obs-muted">Refreshing traces...</p> : null}

      <DataTable
        rows={data?.data ?? []}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => r.timestamp },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "status", label: "Status", render: (r) => r.statusCode ?? "-" },
          {
            key: "latency",
            label: "Latency ms",
            render: (r) => (r.latencyMs == null ? "-" : r.latencyMs.toFixed(2)),
          },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId },
        ]}
      />
    </section>
  );
}
