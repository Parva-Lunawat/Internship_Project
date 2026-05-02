import { runScenario } from "../lib/scenario.mjs";
import { createCookieJar, getEnvString, readJsonSafe, timedFetch } from "../lib/http.mjs";

const password = () => getEnvString("PASSWORD", "Codal@123");
const email = () => getEnvString("EMAIL", "bench-comments@zeon.local");

async function authCookie(baseUrl) {
  const jar = createCookieJar();
  await timedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Benchmark Comments", email: email(), password: password(), confirmPassword: password() }),
  }).catch(() => {});
  const { res } = await timedFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email(), password: password() }),
  });
  jar.setFromSetCookie(res.headers.get("set-cookie"));
  return jar.header();
}

async function ensureBlog(baseUrl, cookie) {
  const slug = `bench-comments-${Date.now().toString(36)}`;
  const { res } = await timedFetch(`${baseUrl}/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      pageTitle: slug,
      title: `Benchmark Comments ${slug}`,
      excerpt: "Benchmark comments excerpt. ".repeat(10).slice(0, 220),
      coverImage: "https://example.com/cover.png",
      content: "Benchmark comments content. ".repeat(80),
      tags: ["bench", "comments"],
      status: "published",
    }),
  });
  const payload = await readJsonSafe(res);
  return payload?.id ?? payload?.data?.id;
}

await runScenario({
  scenario: "comment_creation_burst",
  setup: async (ctx) => {
    ctx.cookie = await authCookie(ctx.baseUrl);
    ctx.blogId = await ensureBlog(ctx.baseUrl, ctx.cookie);
    ctx.counter = 0;
  },
  worker: async (ctx, workerId) => {
    const i = (ctx.counter += 1);
    const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/blogs/${ctx.blogId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ctx.cookie },
      body: JSON.stringify({ content: `Load test comment ${workerId}-${i}` }),
    });
    return { ok: res.ok, durationMs };
  },
});
