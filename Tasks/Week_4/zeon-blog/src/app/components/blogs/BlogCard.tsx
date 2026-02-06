import Link from "next/link";
import type { posts } from "@/src/lib/postsZeon";

type Props = {
    post: posts;
};

function TagPills({ tags }: { tags: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

export default function BlogCard({ post }: { post: posts }) {
  const img = post.coverImage ??
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60";
  const author = post.author.name ?? "Zeon Team";

  return (
    <Link
      href={`/blogs/${post.pageTitle}`}
      className="group block h-full overflow-hidden rounded-2xl border transition hover:bg-gray-50"
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
        <p className="text-xs text-gray-500">
          {author} • {post.publishedAt}
        </p>
        
        <h4 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">
          {post.title}
        </h4>
        
        <p className="mt-2 line-clamp-2 text-xs text-gray-600">
          {post.excerpt}
        </p>
        
        <TagPills tags={post.tags.slice(0, 2)} />
      </div>
    </Link>
  );
}