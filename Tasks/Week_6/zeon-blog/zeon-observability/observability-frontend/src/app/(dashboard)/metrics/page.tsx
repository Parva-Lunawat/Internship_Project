"use client";

import { useState } from "react";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type BucketRow = {
  bucket: string;
  bucketStart: string;
  bucketEnd: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughput: number;
};

type RequestRow = {
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  requestId: string | null;
  traceId: string | null;
  userId: string | null;
  errorCategory: string;
};

type Insight = {
  totalRequests: number;
  statusCodeDistribution: Array<{ label: string; count: number }>;
  methodDistribution: Array<{ label: string; count: number }>;
  errorCategoryDistribution: Array<{ label: string; count: number }>;
  latencyBandDistribution: Array<{ label: string; count: number }>;
};

function DistList({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <div style={{ marginBottom: 16 }}>
      <h4>{title}</h4>
      <div className="obs-bars">
        {rows.length === 0 ? <p className="obs-muted">No data.</p> : null}
        {rows.map((row) => (
          <div className="obs-bar" key={row.label}>
            <span>{row.label}</span>
            <span className="obs-bar-track"><span className="obs-bar-fill" style={{ width: `${(row.count / max) * 100}%` }} /></span>
            <span>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BucketModal({ bucket, onClose }: { bucket: BucketRow; onClose: () => void }) {
  const filters = useDashboardFilters();
  const query = filters.buildQuery({ bucketStart: bucket.bucketStart, bucketEnd: bucket.bucketEnd });
  const requests = useObservabilityData<{ data: RequestRow[] }>(`/buckets/requests${query}`, { data: [] });
  const insights = useObservabilityData<{ data: Insight }>(`/buckets/insights${query}`, {
    data: { totalRequests: 0, statusCodeDistribution: [], methodDistribution: [], errorCategoryDistribution: [], latencyBandDistribution: [] },
  });
  const [selected, setSelected] = useState<RequestRow | null>(null);

  return (
    <div className="obs-modal-backdrop" role="dialog" aria-modal="true">
      <div className="obs-modal">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Bucket {new Date(bucket.bucketStart).toLocaleString()}</h3>
            <p className="obs-muted">{bucket.requestCount} requests · {bucket.errorCount} errors · p95 {bucket.p95LatencyMs.toFixed(1)}ms</p>
          </div>
          <button className="obs-btn secondary" onClick={onClose}>Close</button>
        </div>
        <div className="obs-modal-grid">
          <div>
            {requests.isLoading ? <p className="obs-muted">Refreshing bucket requests...</p> : null}
            <DataTable
              rows={requests.data.data}
              onRowClick={setSelected}
              columns={[
                { key: "ts", label: "Time", render: (r) => new Date(r.timestamp).toLocaleTimeString() },
                { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
                { key: "status", label: "Status", render: (r) => r.statusCode },
                { key: "lat", label: "Latency", render: (r) => `${r.latencyMs.toFixed(1)}ms` },
                { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
                { key: "user", label: "User", render: (r) => r.userId ?? "-" },
                { key: "cat", label: "Category", render: (r) => r.errorCategory },
              ]}
            />
            {selected ? (
              <div className="obs-card" style={{ marginTop: 12 }}>
                <h4 style={{ marginTop: 0 }}>Request Detail</h4>
                <p><strong>{selected.method} {selected.endpoint}</strong></p>
                <p className="obs-muted">requestId: {selected.requestId ?? "-"}<br />traceId: {selected.traceId ?? "-"}<br />status: {selected.statusCode} · latency: {selected.latencyMs.toFixed(1)}ms</p>
              </div>
            ) : null}
          </div>
          <div>
            {insights.isLoading ? <p className="obs-muted">Refreshing insight charts...</p> : null}
            <DistList title="Status Codes" rows={insights.data.data.statusCodeDistribution} />
            <DistList title="Methods" rows={insights.data.data.methodDistribution} />
            <DistList title="Error Categories" rows={insights.data.data.errorCategoryDistribution} />
            <DistList title="Latency Bands" rows={insights.data.data.latencyBandDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const filters = useDashboardFilters();
  const [bucket, setBucket] = useState<BucketRow | null>(null);
  const { data, isLoading } = useObservabilityData<{ data: BucketRow[] }>(`/buckets${filters.buildQuery()}`, { data: [] });
  const max = Math.max(1, ...data.data.map((row) => row.requestCount));

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Latency + Throughput Buckets</h2>
      <p className="obs-muted">Buckets update from the global endpoint, duration, and interval controls. Click any bucket for request details and diagram-ready insight data.{isLoading ? " Refreshing..." : ""}</p>
      <div className="obs-bucket-grid">
        {data.data.length === 0 ? <p className="obs-muted">No metric buckets found.</p> : null}
        {data.data.map((row) => (
          <button className="obs-bucket" key={row.bucketStart} onClick={() => setBucket(row)}>
            <strong>{new Date(row.bucketStart).toLocaleString()}</strong><br />
            <span className="obs-muted">{row.requestCount} req · {row.errorCount} err</span>
            <span className="obs-bar-track" style={{ display: "block", marginTop: 8 }}><span className="obs-bar-fill" style={{ width: `${(row.requestCount / max) * 100}%` }} /></span>
            <span className="obs-muted">p95 {row.p95LatencyMs.toFixed(1)}ms · {row.throughput.toFixed(2)}/s</span>
          </button>
        ))}
      </div>
      {bucket ? <BucketModal bucket={bucket} onClose={() => setBucket(null)} /> : null}
    </section>
  );
}
