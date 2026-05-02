"use client";

import { useState } from "react";

import { useDashboardFilters, useObservabilityData } from "@/src/components/DashboardFilters";
import { DataTable } from "@/src/components/DataTable";

type EventRow = {
  timestamp: string;
  eventType: string;
  endpoint: string;
  method: string;
  userId: string | null;
  requestId: string | null;
  traceId: string | null;
  payload: Record<string, unknown> | null;
};

type EventsResponse = { data: EventRow[]; meta: { total: number; page: number; limit: number } };

export default function EventsPage() {
  const filters = useDashboardFilters();
  const [eventType, setEventType] = useState("");
  const { data, isLoading } = useObservabilityData<EventsResponse>(
    `/events${filters.buildQuery({ page: 1, limit: 50, eventType })}`,
    { data: [], meta: { total: 0, page: 1, limit: 50 } },
  );

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Application Events</h2>
      <div className="obs-filters">
        <input placeholder="event type" value={eventType} onChange={(e) => setEventType(e.target.value)} />
      </div>
      {isLoading ? <p className="obs-muted">Refreshing events...</p> : null}
      <DataTable
        rows={data.data}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => new Date(r.timestamp).toLocaleString() },
          { key: "type", label: "Event", render: (r) => r.eventType },
          { key: "user", label: "User", render: (r) => r.userId ?? "-" },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId ?? "-" },
          { key: "payload", label: "Payload", render: (r) => r.payload ? JSON.stringify(r.payload).slice(0, 120) : "-" },
        ]}
      />
    </section>
  );
}
