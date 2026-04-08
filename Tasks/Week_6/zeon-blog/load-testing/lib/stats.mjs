export function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

export function summarizeDurations(durationsMs) {
  const sorted = [...durationsMs].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sorted.length ? sum / sorted.length : 0;
  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    avg,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
}

export function buildSummary({
  scenario,
  startedAt,
  endedAt,
  baseUrl,
  durationsMs,
  errors,
  totalRequests,
  extra = {},
}) {
  const durationSec = Math.max(0.001, (endedAt - startedAt) / 1000);
  const latencyMs = summarizeDurations(durationsMs);
  const errorRate = totalRequests ? errors / totalRequests : 0;
  return {
    scenario,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    baseUrl,
    requests: totalRequests,
    errors,
    errorRate,
    latencyMs,
    throughput: {
      rps: totalRequests / durationSec,
    },
    ...extra,
  };
}

