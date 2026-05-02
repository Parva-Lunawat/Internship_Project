"use client";

import { useState } from "react";

import { fetchObservability } from "@/src/lib/api";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";

type CorrelationPayload = {
  data: {
    summary: Record<string, unknown>;
    metrics: unknown[];
    logs: unknown[];
    events: unknown[];
    traces: unknown[];
  };
};

export default function CorrelationPage() {
  const { ready, token } = useRequireAdmin();
  const [requestId, setRequestId] = useState("");
  const [traceId, setTraceId] = useState("");
  const [data, setData] = useState<CorrelationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lookup = async (mode: "request" | "trace") => {
    if (!token) return;
    const value = mode === "request" ? requestId.trim() : traceId.trim();
    if (!value) return;
    setError(null);
    setIsLoading(true);
    try {
      const payload = await fetchObservability<CorrelationPayload>(
        token,
        `/correlation/${mode}/${encodeURIComponent(value)}`,
      );
      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Correlation lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Correlation Explorer</h2>
      <p className="obs-muted">
        Resolve a request or trace identifier into linked metrics, logs, events,
        and trace entries.
      </p>

      <div className="obs-grid-2">
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>By Request ID</h3>
          <div className="obs-filters">
            <input
              placeholder="requestId"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            />
            <button className="obs-btn" onClick={() => void lookup("request")}>
              Lookup request
            </button>
          </div>
        </div>
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>By Trace ID</h3>
          <div className="obs-filters">
            <input
              placeholder="traceId"
              value={traceId}
              onChange={(e) => setTraceId(e.target.value)}
            />
            <button className="obs-btn" onClick={() => void lookup("trace")}>
              Lookup trace
            </button>
          </div>
        </div>
      </div>

      {isLoading ? <p className="obs-muted">Loading correlation payload...</p> : null}
      {error ? <p className="obs-danger">{error}</p> : null}

      {data ? (
        <div className="obs-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            {JSON.stringify(data.data.summary, null, 2)}
          </pre>
          <p className="obs-muted" style={{ marginBottom: 0, marginTop: 12 }}>
            metrics: {data.data.metrics.length}, logs: {data.data.logs.length},
            events: {data.data.events.length}, traces: {data.data.traces.length}
          </p>
        </div>
      ) : null}
    </section>
  );
}
