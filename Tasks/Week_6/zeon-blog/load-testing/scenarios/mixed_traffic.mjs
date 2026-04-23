import { runScenario } from "../lib/scenario.mjs";
import { Blob } from "node:buffer";
import {
  createCookieJar,
  getEnvNumber,
  getEnvString,
  readJsonSafe,
  timedFetch,
} from "../lib/http.mjs";

function strongPassword() {
  return getEnvString("PASSWORD", "Codal@123");
}

function email() {
  return getEnvString("EMAIL", "bench-mixed@zeon.local");
}

function tinyPngBytes() {
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAf8X7nYAAAAASUVORK5CYII=";
  return Buffer.from(b64, "base64");
}

async function authCookie(baseUrl) {
  const jar = createCookieJar();
  await timedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Benchmark Mixed",
      email: email(),
      password: strongPassword(),
      confirmPassword: strongPassword(),
    }),
  }).catch(() => {});

  const { res } = await timedFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email(), password: strongPassword() }),
  });
  jar.setFromSetCookie(res.headers.get("set-cookie"));
  return jar.header();
}

function pick(weights) {
  const total = weights.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const it of weights) {
    r -= it.w;
    if (r <= 0) return it.k;
  }
  return weights[weights.length - 1].k;
}

await runScenario({
  scenario: "mixed_traffic",
  setup: async (ctx) => {
    ctx.cookie = await authCookie(ctx.baseUrl);
    ctx.counter = 0;
    ctx.runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    ctx.weights = [
      { k: "public_list", w: getEnvNumber("W_PUBLIC_LIST", 45) },
      { k: "detail", w: getEnvNumber("W_DETAIL", 25) },
      { k: "login", w: getEnvNumber("W_LOGIN", 10) },
      { k: "write", w: getEnvNumber("W_WRITE", 15) },
      { k: "upload", w: getEnvNumber("W_UPLOAD", 5) },
    ];
  },
  worker: async (ctx, workerId) => {
    const choice = pick(ctx.weights);

    if (choice === "public_list") {
      const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/blogs?page=1&pageSize=6`, {
        method: "GET",
      });
      return { ok: res.ok, durationMs };
    }

    if (choice === "detail") {
      const list = await timedFetch(`${ctx.baseUrl}/blogs?page=1&pageSize=1`, { method: "GET" });
      const payload = await readJsonSafe(list.res);
      const pageTitle = payload?.blogs?.[0]?.pageTitle ?? payload?.data?.[0]?.pageTitle;
      if (!pageTitle) return { ok: false, durationMs: list.durationMs };
      const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/blogs/${encodeURIComponent(pageTitle)}`, {
        method: "GET",
      });
      return { ok: res.ok, durationMs };
    }

    if (choice === "login") {
      const jar = createCookieJar();
      const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email(), password: strongPassword() }),
      });
      jar.setFromSetCookie(res.headers.get("set-cookie"));
      return { ok: res.ok, durationMs };
    }

    if (choice === "write") {
      const i = (ctx.counter += 1);
      const slug = `bench-mixed-${ctx.runId}-${workerId}-${i}`;
      const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: ctx.cookie },
        body: JSON.stringify({
          pageTitle: slug,
          title: `Mixed Title ${slug}`,
          excerpt: `Mixed excerpt ${i}. `.repeat(10).slice(0, 200),
          coverImage: "https://example.com/cover.png",
          content: `Mixed content ${i}. `.repeat(80),
          tags: ["bench", "mixed"],
          status: "draft",
        }),
      });
      return { ok: res.ok, durationMs };
    }

    // upload
    const form = new FormData();
    form.append("file", new Blob([tinyPngBytes()], { type: "image/png" }), "bench.png");
    const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/uploads`, {
      method: "POST",
      headers: { Cookie: ctx.cookie },
      body: form,
    });
    return { ok: res.ok, durationMs };
  },
});

