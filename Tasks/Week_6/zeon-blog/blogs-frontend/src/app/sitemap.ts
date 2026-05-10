import type { MetadataRoute } from "next";
import { getPublishedBlogs } from "@/src/lib/api/blogsApi";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPublishedBlogs({ page: 1, pageSize: 50 });
    return payload.blogs
      .filter((blog) => blog.status === "published" && blog.visibility === "public")
      .map((blog) => ({
        url: `${siteUrl}/blogs/${blog.pageTitle}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}