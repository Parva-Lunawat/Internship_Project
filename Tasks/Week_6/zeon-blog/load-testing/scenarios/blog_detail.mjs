import { runScenario } from "../lib/scenario.mjs";
import { readJsonSafe, timedFetch } from "../lib/http.mjs";

async function resolvePageTitle(baseUrl) {
  const listUrl = `${baseUrl}/blogs?page=1&pageSize=1`;
  const { res } = await timedFetch(listUrl, { method: "GET" });
  const payload = await readJsonSafe(res);
  const first = payload?.data?.[0];
  return first?.pageTitle || null;
}

await runScenario({
  scenario: "blog_detail",
  setup: async (ctx) => {
    ctx.pageTitle = process.env.PAGE_TITLE || (await resolvePageTitle(ctx.baseUrl));
  },
  worker: async (ctx) => {
    const pageTitle = ctx.pageTitle;
    if (!pageTitle) return { ok: false, durationMs: 0 };
    const url = `${ctx.baseUrl}/blogs/${encodeURIComponent(pageTitle)}`;
    const { res, durationMs } = await timedFetch(url, { method: "GET" });
    return { ok: res.ok, durationMs };
  },
});

