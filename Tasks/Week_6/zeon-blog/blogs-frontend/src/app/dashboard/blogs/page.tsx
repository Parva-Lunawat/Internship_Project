"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyBlogs, deleteMyBlog, BlogsApiResponse } from "@/src/lib/api/blogsApi";
import { Search, Edit, Trash2, Eye, Loader2, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import Pagination from "@/src/app/blogs/Pagination";

export default function MyBlogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven values
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentQuery = searchParams.get("query") || "";
  const currentStatus = (searchParams.get("status") as 'draft' | 'published' | '') || "";
  const currentTag = searchParams.get("tag") || "";

  const [blogsData, setBlogsData] = useState<BlogsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Local form states
  const [search, setSearch] = useState(currentQuery);
  const [status, setStatus] = useState(currentStatus);
  const [tag, setTag] = useState(currentTag);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync local form state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setSearch(currentQuery);
    setStatus(currentStatus);
    setTag(currentTag);
  }, [currentQuery, currentStatus, currentTag]);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const data = await getMyBlogs({
        page: currentPage,
        pageSize: 6,
        query: currentQuery || undefined,
        status: currentStatus || undefined,
        tag: currentTag || undefined
      });
      setBlogsData(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, currentQuery, currentStatus, currentTag]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("query", search.trim());
    else params.delete("query");

    if (status) params.set("status", status);
    else params.delete("status");

    if (tag.trim()) params.set("tag", tag.trim());
    else params.delete("tag");

    params.set("page", "1"); // reset to page 1 on new search

    router.push(`/dashboard/blogs?${params.toString()}`);
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    setDeletingId(blogId);
    try {
      await deleteMyBlog(blogId);
      fetchBlogs();
    } catch {
      alert("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };
  const handleEdit = (blogId: string) => {
    router.push(`/write?id=${blogId}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles..."
              className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <select
              className="min-w-[120px] appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published" | "")}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter by tag..."
                className="min-w-[150px] rounded-xl border border-gray-300 bg-white pl-4 pr-4 py-2 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-bold text-white transition-all active:scale-95 hover:bg-black dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black opacity-20 dark:text-white" />
        </div>
      ) : blogsData?.blogs.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <h3 className="text-xl font-bold">No results</h3>
          <p className="text-gray-500 mt-2 mb-8 dark:text-gray-400">You haven&apos;t created any posts matching your search.</p>
          <Link href="/write" className="font-bold underline text-gray-900 dark:text-sky-300">Write something new</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData?.blogs.map((blog) => (
            <div key={blog.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 transition-all duration-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-slate-900 dark:hover:bg-slate-800/70">
              <div className="aspect-video relative overflow-hidden bg-gray-100 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                <div className="absolute top-4 right-4 focus:outline-none">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${blog.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {blog.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-tight text-gray-400 dark:text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>

                <h3 className="text-lg font-bold leading-tight mb-2">
                  {blog.title}
                </h3>
                <p className="mb-6 flex-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                  {blog.status === "draft" ? (
                    <Link
                      href={`/dashboard/blogs/preview/${blog.id}`}
                      className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-black dark:text-gray-500 dark:hover:text-sky-300"
                    >
                      <Eye className="h-3 w-3 mr-1.5" />
                      Preview
                    </Link>
                  ) : (
                  <Link
                    href={`/blogs/${blog.pageTitle}`}
                    className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-black dark:text-gray-500 dark:hover:text-sky-300"
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    Preview
                  </Link>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(blog.id)}
                      className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-gray-100 hover:bg-white hover:text-black dark:hover:border-gray-700 dark:hover:bg-slate-900 dark:hover:text-sky-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      disabled={deletingId === blog.id}
                      className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-red-100 hover:bg-white hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-slate-900"
                    >
                      {deletingId === blog.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={blogsData?.meta.totalPages || 0}
        basePath="/dashboard/blogs"
        extraParams={{
          query: currentQuery,
          tag: currentTag,
          status: currentStatus
        }}
      />
    </div>
  );
}
