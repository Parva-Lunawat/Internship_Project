"use client";

import { useEffect, useState } from "react";

export function usePolling<T>(
  enabled: boolean,
  intervalMs: number,
  loader: () => Promise<T>,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const result = await loader();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    const timer = setInterval(() => {
      void run();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, intervalMs, loader]);

  return { data, isLoading, error, setData };
}
