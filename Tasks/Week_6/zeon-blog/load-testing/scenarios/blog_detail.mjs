import { runScenario } from "../lib/scenario.mjs";
import { readJsonSafe, timedFetch } from "../lib/http.mjs";

async function resolvePageTitle(baseUrl) {
  const listUrl = `${baseUrl}/blogs?page=1&pageSize=1`;
  const { res } = await timedFetch(listUrl, { method: "GET" });
  const payload = await readJsonSafe(res);
  const first = payload?.blogs?.[0] ?? payload?.data?.[0];
  return first?.pageTitle || null;
}

await runScenario({
  scenario: "blog_detail",
  setup: async (ctx) => {
    ctx.pageTitle = process.env.PAGE_TITLE || (await resolvePageTitle(ctx.baseUrl));
    if (!ctx.pageTitle) {
      throw new Error(
        "No published blog pageTitle found. Create/publish at least one blog or pass PAGE_TITLE.",
      );
    }
  },
  worker: async (ctx) => {
    const url = `${ctx.baseUrl}/blogs/${encodeURIComponent(ctx.pageTitle)}`;
    const { res, durationMs } = await timedFetch(url, { method: "GET" });
    return { ok: res.ok, durationMs };
  },
});

