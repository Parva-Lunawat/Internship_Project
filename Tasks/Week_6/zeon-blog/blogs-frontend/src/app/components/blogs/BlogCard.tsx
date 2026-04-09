"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/src/lib/api/blogsApi";

export function TagPills({ tags }: { tags: { id: string; name: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
        >
          #{tag.name}
        </span>
      ))}
    </div>
  );
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  const img =
    post.coverImage ??
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60";
  const author = post.author.name ?? "Zeon Team";

  return (
    <div
      onClick={() => router.push(`/blogs/${post.pageTitle}`)}
      className="group block h-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={img}
          alt={post.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Link
            href={`/profile/${post.author.id}`}
            className="relative z-10 font-medium hover:text-black hover:underline dark:hover:text-sky-300"
            onClick={(e) => e.stopPropagation()}
          >
            {author}
          </Link>
          <span className="mx-1">-</span>
          <span>{post.publishedAt}</span>
        </div>
        <h4 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">{post.title}</h4>
        <p className="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{post.excerpt}</p>
        <TagPills tags={post.tags.slice(0, 2)} />
      </div>
    </div>
  );
}
