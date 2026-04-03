"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogPost, getMyBlogs, deleteMyBlog, BlogsApiResponse } from "@/src/lib/api/blogsApi";
import { Plus, Search, Edit, Trash2, Eye, Loader2, FileText, Calendar } from "lucide-react";
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
    } catch (err) {
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
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-100">
        <div className="flex flex-col md:flex-row flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm bg-white appearance-none min-w-[120px]"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter by tag..."
                className="pl-4 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm min-w-[150px]"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 text-sm"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black opacity-20" />
        </div>
      ) : blogsData?.blogs.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-gray-100">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <h3 className="text-xl font-bold">No results</h3>
          <p className="text-gray-500 mt-2 mb-8">You haven't created any posts matching your search.</p>
          <Link href="/write" className="text-black font-bold underline">Write something new</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData?.blogs.map((blog) => (
            <div key={blog.id} className="group border rounded-2xl overflow-hidden hover:bg-gray-50 transition-all duration-300 flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-gray-100 border-b">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                <div className="absolute top-4 right-4 focus:outline-none">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${blog.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {blog.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tight">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>

                <h3 className="text-lg font-bold leading-tight mb-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-6 flex-1">
                  {blog.excerpt}
                </p>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <Link
                    href={`/blogs/${blog.pageTitle}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center"
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    Preview
                  </Link>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(blog.id)}
                      className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      disabled={deletingId === blog.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-red-100"
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
