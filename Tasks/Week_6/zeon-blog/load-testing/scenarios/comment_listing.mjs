import { runScenario } from "../lib/scenario.mjs";
import { createCookieJar, getEnvString, getRequiredEnvString, readJsonSafe, timedFetch } from "../lib/http.mjs";

const password = () => getRequiredEnvString("PASSWORD");
const email = () => getEnvString("EMAIL", "bench-comment-listing@zeon.local");

async function authCookie(baseUrl) {
  const jar = createCookieJar();
  await timedFetch(`${baseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Benchmark Comment Listing", email: email(), password: password(), confirmPassword: password() }),
  }).catch(() => {});
  const { res } = await timedFetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email(), password: password() }),
  });
  jar.setFromSetCookie(res.headers.get("set-cookie"));
  return jar.header();
}

async function seed(baseUrl, cookie) {
  const slug = `bench-comment-list-${Date.now().toString(36)}`;
  const create = await timedFetch(`${baseUrl}/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      pageTitle: slug,
      title: `Benchmark Comment Listing ${slug}`,
      excerpt: "Benchmark listing excerpt. ".repeat(10).slice(0, 220),
      coverImage: "https://example.com/cover.png",
      content: "Benchmark listing content. ".repeat(80),
      tags: ["bench", "comments"],
      status: "published",
    }),
  });
  const payload = await readJsonSafe(create.res);
  const blogId = payload?.id ?? payload?.data?.id;
  for (let i = 0; i < 10; i += 1) {
    await timedFetch(`${baseUrl}/blogs/${blogId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ content: `Seed comment ${i}` }),
    });
  }
  return blogId;
}

await runScenario({
  scenario: "comment_listing",
  setup: async (ctx) => {
    ctx.cookie = await authCookie(ctx.baseUrl);
    ctx.blogId = await seed(ctx.baseUrl, ctx.cookie);
  },
  worker: async (ctx) => {
    const { res, durationMs } = await timedFetch(`${ctx.baseUrl}/blogs/${ctx.blogId}/comments?page=1&pageSize=20`, { method: "GET" });
    return { ok: res.ok, durationMs };
  },
});
