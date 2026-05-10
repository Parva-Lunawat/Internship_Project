import { getPublishedBlogs } from "@/src/lib/api/blogsApi";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let items = "";
  try {
    const payload = await getPublishedBlogs({ page: 1, pageSize: 50 });
    items = payload.blogs
      .filter((blog) => blog.status === "published" && blog.visibility === "public")
      .map((blog) => `
        <item>
          <title>${escapeXml(blog.title)}</title>
          <link>${siteUrl}/blogs/${escapeXml(blog.pageTitle)}</link>
          <guid>${siteUrl}/blogs/${escapeXml(blog.pageTitle)}</guid>
          <description>${escapeXml(blog.metaDescription || blog.excerpt)}</description>
          <pubDate>${new Date(blog.publishedAt || blog.updatedAt).toUTCString()}</pubDate>
        </item>`)
      .join("");
  } catch {
    items = "";
  }

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Zeon Blog</title>
        <description>Latest public Zeon articles</description>
        <link>${siteUrl}</link>
        ${items}
      </channel>
    </rss>`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}