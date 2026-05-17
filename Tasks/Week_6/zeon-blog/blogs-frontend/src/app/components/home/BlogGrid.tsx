"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BlogPost, getPublishedBlogs } from "@/src/lib/api/blogsApi";
import BlogCard from "../blogs/BlogCard";

export default function BlogGrid() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadPosts = async () => {
            try {
                const data = await getPublishedBlogs({ page: 1, pageSize: 6 });
                if (!cancelled) {
                    setPosts(data.blogs);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Unable to load blogs.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadPosts();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section>
            <header className="space-y-2 pb-6">
                <h1 className="text-3xl font-bold">Blogs</h1>
                <p className="text-gray-600 italic font-bold dark:text-gray-300">The MOST Recent Blogs!!!</p>
            </header>
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
            ) : error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <BlogCard key={post.pageTitle} post={post} />
                    ))}
                </div>
            )}
        </section>
    );
}
