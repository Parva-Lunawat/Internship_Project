import { runScenario } from "../lib/scenario.mjs";
import { Blob } from "node:buffer";
import { createCookieJar, getEnvString, getRequiredEnvString, readJsonSafe, timedFetch } from "../lib/http.mjs";

function strongPassword() {
  return getRequiredEnvString("PASSWORD");
}

function email() {
  return getEnvString("EMAIL", "bench-writer@zeon.local");
}

function makeExcerpt(i) {
  return `Benchmark excerpt ${i}. `.repeat(10).slice(0, 200);
}

function makeContent(i) {
  return `# Benchmark Post ${i}\n\n` + `Content line ${i}. `.repeat(60);
}

async function authCookie(baseUrl) {
  const jar = createCookieJar();
  await timedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Benchmark Writer",
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

await runScenario({
  scenario: "write_burst",
  setup: async (ctx) => {
    ctx.cookie = await authCookie(ctx.baseUrl);
    ctx.counter = 0;
    ctx.runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  },
  worker: async (ctx, workerId) => {
    const i = (ctx.counter += 1);
    const slug = `bench-${ctx.runId}-${workerId}-${i}`;
    const url = `${ctx.baseUrl}/blogs`;
    const { res, durationMs } = await timedFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: ctx.cookie,
      },
      body: JSON.stringify({
        pageTitle: slug,
        title: `Benchmark Title ${slug}`,
        excerpt: makeExcerpt(i),
        coverImage: "https://example.com/cover.png",
        content: makeContent(i),
        tags: ["bench", "write"],
        status: "draft",
      }),
    });
    const payload = await readJsonSafe(res);
    const ok = res.ok && Boolean(payload?.id || payload?.data?.id);
    return { ok, durationMs };
  },
});

