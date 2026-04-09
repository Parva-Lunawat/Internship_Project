import Link from "next/link";
import type { BlogPost } from "@/src/lib/api/blogsApi";
import { TagPills } from "./BlogCard";

export default function BigFeaturedCard({ post }: { post: BlogPost }) {
  const img =
    post.coverImage ??
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=60";
  const author = post.author.name ?? "Zeon Team";

  return (
    <Link
      href={`/blogs/${post.pageTitle}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={img}
          alt={post.title}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">{author} - {post.publishedAt}</p>
        <h3 className="mt-2 text-xl font-semibold leading-snug">{post.title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{post.excerpt}</p>
        <TagPills tags={post.tags} />
      </div>
    </Link>
  );
}
