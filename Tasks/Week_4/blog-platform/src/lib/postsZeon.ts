export type posts = {
    pageTitle: string;
    title: string;
    excerpt: string;
    content: string;
    tags: Array<string>;
    publishedAt: string;
    status: "draft" | "published";
};

const dummyPosts: Array<posts> = [
    {
    pageTitle: "hello-nextjs",
    title: "Hello Next.js",
    excerpt: "My first post using Next.js App Router + TS + Tailwind.",
    content: "This is the detailed content for Hello Next.js...",
    tags: ["nextjs", "typescript"],
    publishedAt: "2026-01-30",
    status: "published",
  },
  {
    pageTitle: "tailwind-basics",
    title: "Tailwind Basics That Actually Matter",
    excerpt: "A short practical guide to Tailwind in real projects.",
    content: "This is the detailed content for Tailwind Basics...",
    tags: ["tailwind"],
    publishedAt: "2026-01-29",
    status: "published",
  },
];

export function getAllPublishedPosts(): Array<posts> {
    return dummyPosts.filter((p) => p.status === "published")
        .sort((a, b) => (a.publishedAt < b.publishedAt) ? 1 : -1);
}

export function getPostsBypageTitle(pageTitle: string): posts | undefined {
    return dummyPosts.find((p) => p.pageTitle === pageTitle && p.status === "published");
}