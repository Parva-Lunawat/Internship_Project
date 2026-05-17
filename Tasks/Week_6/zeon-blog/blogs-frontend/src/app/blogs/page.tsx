"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BlogCard from "../components/blogs/BlogCard";
import Pagination from "./Pagination";
import SearchBar from "./searchBar";
import { getPublishedBlogs, BlogPost, BlogsApiResponse } from "@/src/lib/api/blogsApi";

const PAGE_SIZE = 6;

export default function PaginatedBlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
        </div>
      }
    >
      <PaginatedBlogsContent />
    </Suspense>
  );
}

function PaginatedBlogsContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1") || 1;
  const query = searchParams.get("query")?.trim() || undefined;
  const tag = searchParams.get("tag")?.trim() || undefined;

  const [blogsData, setBlogsData] = useState<BlogsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      setLoading(true);
      try {
        const data = await getPublishedBlogs({ page: currentPage, pageSize: PAGE_SIZE, query, tag });
        if (!cancelled) {
          setBlogsData(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load blog posts.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [currentPage, query, tag]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">All blog posts</h1>
        <SearchBar />
        <p className="text-gray-600 dark:text-gray-300">
          {query || tag
            ? `Showing results${query ? ` for "${query}"` : ""}${tag ? ` in #${tag}` : ""}`
            : "Browse everything we've published."}
        </p>
      </header>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : (
        <>
          <div
            key={`${query}-${tag}-${currentPage}`}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {blogsData?.blogs.length ? (
              blogsData.blogs.map((post: BlogPost) => (
                <BlogCard key={post.pageTitle} post={post} />
              ))
            ) : (
              <p className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400">
                No posts found.
              </p>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={blogsData?.meta.totalPages || 0}
            basePath="/blogs"
            extraParams={{ query, tag }}
          />
        </>
      )}
    </div>
  );
}

// export function BlogsPage(AllPost: Array<posts>) {
//   return (
//     <div className="space-y-6">
//       <header className="space-y-2">
//         <h1 className="text-3xl font-bold">All blog posts</h1>
//         <p className="text-gray-600">Browse everything we've published.</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-4">
//         {AllPost.map((post: posts) => (
//           <BlogCard key={post.pageTitle} post={post} />
//         ))}
//       </div>
//     </div>
//   );
// }
