"use client";

import { useCallback, useState } from "react";

import { DataTable } from "@/src/components/DataTable";
import { fetchObservability } from "@/src/lib/api";
import { OBS_POLL_INTERVAL_MS } from "@/src/lib/config";
import { usePolling } from "@/src/lib/usePolling";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";

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

type EventsResponse = {
  data: EventRow[];
  meta: { total: number; page: number; limit: number };
};

export default function EventsPage() {
  const { ready, token } = useRequireAdmin();
  const [eventType, setEventType] = useState("");
  const [userId, setUserId] = useState("");

  const loader = useCallback(async () => {
    if (!token) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } } as EventsResponse;
    }
    const params = new URLSearchParams({
      page: "1",
      limit: "30",
    });
    if (eventType) params.set("eventType", eventType);
    if (userId) params.set("userId", userId);

    return fetchObservability<EventsResponse>(
      token,
      `/events?${params.toString()}`,
    );
  }, [eventType, token, userId]);

  const { data, isLoading, error } = usePolling(
    ready,
    OBS_POLL_INTERVAL_MS,
    loader,
  );

  return (
    <section className="obs-card">
      <h2 style={{ marginTop: 0 }}>Application Events</h2>
      <div className="obs-filters">
        <input
          placeholder="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        />
        <input
          placeholder="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      {error ? <p className="obs-danger">{error}</p> : null}
      {isLoading ? <p className="obs-muted">Refreshing events...</p> : null}

      <DataTable
        rows={data?.data ?? []}
        columns={[
          { key: "ts", label: "Timestamp", render: (r) => r.timestamp },
          { key: "type", label: "Event", render: (r) => r.eventType },
          { key: "user", label: "User", render: (r) => r.userId ?? "-" },
          { key: "ep", label: "Endpoint", render: (r) => `${r.method} ${r.endpoint}` },
          { key: "req", label: "Request", render: (r) => r.requestId ?? "-" },
          { key: "trace", label: "Trace", render: (r) => r.traceId ?? "-" },
          {
            key: "payload",
            label: "Payload",
            render: (r) =>
              r.payload ? JSON.stringify(r.payload).slice(0, 120) : "-",
          },
        ]}
      />
    </section>
  );
}
