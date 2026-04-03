import { BlogPost } from "@/src/lib/api/blogsApi";
import Link from "next/link";
import { TagPills } from "./BlogCard";

export default function CompactCard({ post }: { post: BlogPost }) {
  const img = post.coverImage ??
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60";
  const author = post.author.name ?? "Zeon Team";

  return (
    <Link
      href={`/blogs/${post.pageTitle}`}
      className="h-full group grid grid-cols-[110px_1fr] gap-4 rounded-2xl border p-4 hover:bg-gray-50 transition"
    >
      <div className="h-full w-full aspect-[3/1] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={img}
          alt={post.title}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{author} • {post.publishedAt}</p>
        <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
          {post.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs text-gray-600"> {post.excerpt} </p>
        <TagPills tags={post.tags.slice(0, 2)} />
      </div>
    </Link>
  );
}