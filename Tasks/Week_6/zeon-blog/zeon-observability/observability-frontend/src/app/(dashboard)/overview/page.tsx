"use client";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";

type SummaryResponse = {
  data: {
    cards: {
      totalRequests: number;
      errorRate: number;
      averageLatencyMs: number;
      p95LatencyMs: number;
      p99LatencyMs: number;
      throughput: number;
      activeEndpoints: number;
      latestError: null | { endpoint: string; method: string; statusCode: number; requestId: string | null };
    };
    topEndpoints: Array<{ method: string; endpoint: string; requestCount: number; errorRate: number; avgLatencyMs: number }>;
    recentIncidents: Array<{ fingerprint: string; title: string; occurrenceCount: number; endpoint: string; status: string }>;
  };
};

function formatNumber(value: number, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0";
}

export default function OverviewPage() {
  const filters = useDashboardFilters();
  const path = `/dashboard/summary${filters.buildQuery()}`;
  const { data, isLoading } = useObservabilityData<SummaryResponse>(path, {
    data: {
      cards: {
        totalRequests: 0,
        errorRate: 0,
        averageLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        throughput: 0,
        activeEndpoints: 0,
        latestError: null,
      },
      topEndpoints: [],
      recentIncidents: [],
    },
  });
  const cards = data.data.cards;

  return (
    <section>
      <div className="obs-card">
        <h2 style={{ marginTop: 0 }}>Zeon Observability Overview</h2>
        <p className="obs-muted">
          Current System Health Overview: Incoming requests, Latency, Errors, Throughput 
          {isLoading ? " Refreshing silently..." : ""}
        </p>
      </div>

      <div className="obs-grid-4">
        <div className="obs-card obs-kpi"><span className="obs-muted">Requests</span><strong>{cards.totalRequests}</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">Error rate</span><strong>{formatNumber(cards.errorRate * 100, 2)}%</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">Avg latency</span><strong>{formatNumber(cards.averageLatencyMs, 1)} ms</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">Throughput</span><strong>{formatNumber(cards.throughput, 2)}/s</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">p95</span><strong>{formatNumber(cards.p95LatencyMs, 1)} ms</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">p99</span><strong>{formatNumber(cards.p99LatencyMs, 1)} ms</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">Active endpoints</span><strong>{cards.activeEndpoints}</strong></div>
        <div className="obs-card obs-kpi"><span className="obs-muted">Latest error</span><strong>{cards.latestError ? `${cards.latestError.statusCode}` : "None"}</strong></div>
      </div>

      <div className="obs-grid-2">
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>Top Endpoints</h3>
          <div className="obs-bars">
            {data.data.topEndpoints.length === 0 ? <p className="obs-muted">No endpoint traffic yet.</p> : null}
            {data.data.topEndpoints.map((row) => (
              <div className="obs-bar" key={`${row.method}-${row.endpoint}`}>
                <span>{row.method} {row.endpoint}</span>
                <span className="obs-bar-track"><span className="obs-bar-fill" style={{ width: `${Math.min(100, row.requestCount * 8)}%` }} /></span>
                <span>{row.requestCount} req</span>
              </div>
            ))}
          </div>
        </div>
        <div className="obs-card">
          <h3 style={{ marginTop: 0 }}>Recent Incidents</h3>
          {data.data.recentIncidents.length === 0 ? <p className="obs-muted">No grouped incidents found.</p> : null}
          {data.data.recentIncidents.map((issue) => (
            <p key={issue.fingerprint}>
              <strong>{issue.title}</strong><br />
              <span className="obs-muted">{issue.endpoint} · {issue.occurrenceCount} occurrences · {issue.status}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="obs-card">
        <h3 style={{ marginTop: 0 }}>Service Flow</h3>
        <div className="obs-flow">
          <div className="obs-flow-node">blogs-frontend<br /><span className="obs-muted">user request</span></div>
          <div className="obs-flow-node">blogs-backend<br /><span className="obs-muted">route + timing</span></div>
          <div className="obs-flow-node">zeon ingestion<br /><span className="obs-muted">MELT batches</span></div>
          <div className="obs-flow-node">dashboard<br /><span className="obs-muted">filters + buckets</span></div>
        </div>
      </div>
    </section>
  );
}
