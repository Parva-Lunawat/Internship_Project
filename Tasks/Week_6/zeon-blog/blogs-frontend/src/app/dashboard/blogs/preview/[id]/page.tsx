"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { BlogPost, getMyBlogById } from "@/src/lib/api/blogsApi";
import { resolveImageUrl } from "@/src/lib/utils/urlUtils";

export default function DraftPreviewPage() {
  const params = useParams<{ id: string }>();
  const blogId = params?.id;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) {
      setError("Invalid preview request.");
      setLoading(false);
      return;
    }

    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyBlogById(blogId);
        setBlog(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview.");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-sky-300" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
        <p className="font-semibold">Preview unavailable</p>
        <p className="mt-2 text-sm">{error || "Blog was not found."}</p>
        <Link
          href="/dashboard/blogs"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Blogs
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300">
          <Eye className="h-3.5 w-3.5" />
          {blog.status === "draft" ? "Draft Preview" : "Preview"}
        </div>
      </div>

      <article className="prose m-0 flex max-w-none flex-col gap-6 dark:prose-invert">
        <div className="flex flex-col gap-2 pb-2">
          <h1 className="text-4xl font-bold">{blog.title}</h1>
          <p className="break-words text-lg italic text-gray-700 dark:text-gray-300">
            {blog.excerpt}
          </p>
        </div>
        <div className="relative overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex content-start gap-5 italic text-white">
                <div>
                  <p className="text-base opacity-90">Written by</p>
                  <p className="text-xl font-bold">{blog.author.name}</p>
                </div>
                <div>
                  <p className="text-base opacity-90">
                    {blog.status === "published" ? "Published on" : "Last updated"}
                  </p>
                  <p className="text-xl font-bold">
                    {blog.status === "published"
                      ? blog.publishedAt || "Recently"
                      : new Date(blog.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <img
                  src={resolveImageUrl(blog.author.avatar)}
                  alt={blog.author.name}
                  className="h-20 w-20 rounded-full border-2 border-white object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="prose prose-stone max-w-none text-justify leading-relaxed prose-headings:font-bold prose-a:text-black prose-img:rounded-3xl prose-pre:rounded-2xl prose-pre:bg-gray-900 dark:prose-invert dark:prose-a:text-sky-300">
          <ReactMarkdown
            components={{
              img: ({ src, alt, title }: ComponentPropsWithoutRef<"img">) => (
                <img
                  src={src}
                  title={title}
                  className="mx-auto my-12 block w-full max-w-[800px] rounded-3xl border border-gray-100 object-cover shadow-xl dark:border-gray-700"
                  alt={alt || "Blog image"}
                />
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
