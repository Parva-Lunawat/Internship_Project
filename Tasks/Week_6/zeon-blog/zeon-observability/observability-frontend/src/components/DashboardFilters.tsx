"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { fetchObservability } from "@/src/lib/api";
import { useRequireAdmin } from "@/src/lib/useRequireAdmin";

type EndpointOption = {
  method: string;
  endpoint: string;
  source: string;
  seenCount: number;
};

type RefreshMode = "manual" | "live" | "30s" | "5m" | "30m";

type DashboardFilters = {
  endpoint: string;
  durationUnit: "all" | "minutes" | "hours" | "days";
  durationValue: number;
  groupBy: "minute" | "hour" | "day";
  refreshMode: RefreshMode;
  refreshKey: number;
  endpoints: EndpointOption[];
  refreshIntervalMs: number;
  setEndpoint: (value: string) => void;
  setDurationUnit: (value: DashboardFilters["durationUnit"]) => void;
  setDurationValue: (value: number) => void;
  setGroupBy: (value: DashboardFilters["groupBy"]) => void;
  setRefreshMode: (value: RefreshMode) => void;
  manualRefresh: () => void;
  buildQuery: (extra?: Record<string, string | number | undefined | null>) => string;
};

const DashboardFilterContext = createContext<DashboardFilters | null>(null);

function refreshMs(mode: RefreshMode) {
  if (mode === "live") return 5000;
  if (mode === "30s") return 30_000;
  if (mode === "5m") return 300_000;
  if (mode === "30m") return 1_800_000;
  return 0;
}

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const { token } = useRequireAdmin();
  const [endpoint, setEndpointRaw] = useState("");
  const [debouncedEndpoint, setDebouncedEndpoint] = useState("");
  const [durationUnit, setDurationUnit] = useState<DashboardFilters["durationUnit"]>("all");
  const [durationValue, setDurationValueRaw] = useState(1);
  const [groupBy, setGroupBy] = useState<DashboardFilters["groupBy"]>("hour");
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("30m");
  const [refreshKey, setRefreshKey] = useState(0);
  const [endpoints, setEndpoints] = useState<EndpointOption[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedEndpoint(endpoint), 300);
    return () => window.clearTimeout(timer);
  }, [endpoint]);

  useEffect(() => {
    if (!token) return;
    fetchObservability<{ data: EndpointOption[] }>(token, "/endpoints")
      .then((payload) => setEndpoints(payload.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load endpoints"));
  }, [token, refreshKey]);

  const setDurationValue = useCallback((value: number) => {
    setDurationValueRaw(Number.isFinite(value) && value > 0 ? Math.floor(value) : 1);
  }, []);

  const buildQuery = useCallback(
    (extra?: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams();
      if (debouncedEndpoint) params.set("endpoint", debouncedEndpoint);
      params.set("durationUnit", durationUnit);
      if (durationUnit !== "all") params.set("durationValue", String(durationValue));
      params.set("groupBy", groupBy);
      for (const [key, value] of Object.entries(extra ?? {})) {
        if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
      }
      const text = params.toString();
      return text ? `?${text}` : "";
    },
    [debouncedEndpoint, durationUnit, durationValue, groupBy],
  );

  const value = useMemo<DashboardFilters>(
    () => ({
      endpoint,
      durationUnit,
      durationValue,
      groupBy,
      refreshMode,
      refreshKey,
      endpoints,
      refreshIntervalMs: refreshMs(refreshMode),
      setEndpoint: setEndpointRaw,
      setDurationUnit,
      setDurationValue,
      setGroupBy,
      setRefreshMode,
      manualRefresh: () => setRefreshKey((x) => x + 1),
      buildQuery,
    }),
    [buildQuery, durationUnit, durationValue, endpoint, endpoints, groupBy, refreshKey, refreshMode, setDurationValue],
  );

  return <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>;
}

export function useDashboardFilters() {
  const value = useContext(DashboardFilterContext);
  if (!value) throw new Error("useDashboardFilters must be used inside DashboardFilterProvider");
  return value;
}

export function GlobalFilterBar() {
  const filters = useDashboardFilters();
  const uniqueEndpoints = Array.from(new Set(filters.endpoints.map((item) => item.endpoint))).sort();

  return (
    <div className="obs-global-filter obs-card">
      <label>
        <span>Endpoint</span>
        <select value={filters.endpoint} onChange={(e) => filters.setEndpoint(e.target.value)}>
          <option value="">All endpoints</option>
          {uniqueEndpoints.map((endpoint) => (
            <option key={endpoint} value={endpoint}>{endpoint}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Duration</span>
        <select value={filters.durationUnit} onChange={(e) => filters.setDurationUnit(e.target.value as DashboardFilters["durationUnit"])}>
          <option value="all">All Time</option>
          <option value="minutes">Last N minutes</option>
          <option value="hours">Last N hours</option>
          <option value="days">Last N days</option>
        </select>
      </label>
      {filters.durationUnit !== "all" ? (
        <label>
          <span>Amount</span>
          <input type="number" min={1} max={365} value={filters.durationValue} onChange={(e) => filters.setDurationValue(Number(e.target.value))} />
        </label>
      ) : null}
      <label>
        <span>Bucket</span>
        <select value={filters.groupBy} onChange={(e) => filters.setGroupBy(e.target.value as DashboardFilters["groupBy"])}>
          <option value="minute">Minute</option>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
        </select>
      </label>
      <label>
        <span>Refresh</span>
        <select value={filters.refreshMode} onChange={(e) => filters.setRefreshMode(e.target.value as RefreshMode)}>
          <option value="manual">Manual</option>
          <option value="30s">30 seconds</option>
          <option value="5m">5 minutes</option>
          <option value="30m">30 minutes</option>
          <option value="live">Live 5 seconds</option>
        </select>
      </label>
      <button className="obs-btn" onClick={filters.manualRefresh}>Refresh now</button>
    </div>
  );
}

const cache = new Map<string, unknown>();

export function useObservabilityData<T>(path: string, fallback: T) {
  const { token, ready } = useRequireAdmin();
  const filters = useDashboardFilters();
  const [data, setData] = useState<T>(() => (cache.get(path) as T) ?? fallback);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  useEffect(() => {
    if (!ready || !token) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await fetchObservability<T>(token, pathRef.current);
        cache.set(pathRef.current, result);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    if (filters.refreshIntervalMs <= 0) {
      return () => {
        cancelled = true;
      };
    }
    const timer = window.setInterval(() => void load(), filters.refreshIntervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [filters.refreshIntervalMs, filters.refreshKey, path, ready, token]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return { data, isLoading, error };
}
