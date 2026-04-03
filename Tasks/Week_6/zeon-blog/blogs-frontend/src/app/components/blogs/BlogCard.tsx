"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/src/lib/api/blogsApi";

export function TagPills({ tags }: { tags: { id: string; name: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const tagId = tag.id;
        const tagName = tag.name;
        return (<span
          key={tagId}
          className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700"
        >
          #{tagName}
        </span>);
      })}
    </div>
  );
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  const img = post.coverImage ??
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60";
  const author = post.author.name ?? "Zeon Team";

  return (
    <div
      onClick={() => router.push(`/blogs/${post.pageTitle}`)}
      className="group block h-full overflow-hidden rounded-2xl border transition hover:bg-gray-50 cursor-pointer"
    >
      {/* Image Container - Now on top */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={post.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Content Container */}
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Link 
            href={`/profile/${post.author.id}`}
            className="hover:text-black hover:underline font-medium relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {author}
          </Link>
          <span className="mx-1">•</span>
          <span>{post.publishedAt}</span>
        </div>
        <h4 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">
          {post.title}
        </h4>
        <p className="mt-2 line-clamp-2 text-xs text-gray-600">
          {post.excerpt}
        </p>
        <TagPills tags={post.tags.slice(0, 2)} />
      </div>
    </div>
  );
}