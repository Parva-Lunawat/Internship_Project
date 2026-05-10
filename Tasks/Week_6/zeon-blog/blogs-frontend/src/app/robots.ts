import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/write", "/login", "/signup"],
    },
    sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173").replace(/\/$/, "")}/sitemap.xml`,
  };
}