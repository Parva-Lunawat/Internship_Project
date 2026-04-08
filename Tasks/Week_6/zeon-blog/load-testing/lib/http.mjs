import { performance } from "node:perf_hooks";

export function getEnvNumber(name, fallback) {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function getEnvString(name, fallback) {
  const raw = process.env[name];
  return raw && raw.trim().length ? raw.trim() : fallback;
}

export function createCookieJar() {
  const jar = new Map();
  return {
    setFromSetCookie(setCookieHeaders) {
      if (!setCookieHeaders) return;
      const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      for (const h of headers) {
        if (!h || typeof h !== "string") continue;
        const [pair] = h.split(";");
        const eq = pair.indexOf("=");
        if (eq <= 0) continue;
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (name) jar.set(name, value);
      }
    },
    header() {
      if (jar.size === 0) return "";
      return Array.from(jar.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
  };
}

export async function timedFetch(url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const durationMs = performance.now() - start;
  return { res, durationMs };
}

export async function readJsonSafe(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

