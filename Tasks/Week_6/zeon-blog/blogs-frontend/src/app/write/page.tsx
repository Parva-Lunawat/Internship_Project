"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../Redux/selector-functions/authSelector";
import { createBlog, updateMyBlog, getMyBlogById, BlogPost } from "@/src/lib/api/blogsApi";
import { 
    Save, 
    X, 
    Image as ImageIcon, 
    Type, 
    FileText, 
    Hash, 
    Globe, 
    Lock, 
    Loader2,
    ArrowLeft
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import TrueTextEditor from "../components/blogs/trueTextEditor";
// import RichTextEditor from "../components/blogs/RichTextEditor";

export default function WriteBlogPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
            </div>
        }>
            <WriteBlogContent />
        </Suspense>
    );
}

function WriteBlogContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const blogId = searchParams.get("id");
    
    const user = useAppSelector(selectAuthUser);
    const hydrated = useAppSelector(selectAuthHydrated);

    const [formData, setFormData] = useState({
        title: "",
        pageTitle: "",
        excerpt: "",
        content: "",
        coverImage: "",
        tags: "",
        status: "draft" as "draft" | "published"
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!blogId);

    useEffect(() => {
        if (hydrated && !user) {
            router.push("/login?redirect=/write");
        }
    }, [user, hydrated, router]);

    useEffect(() => {
        if (blogId) {
            const fetchBlog = async () => {
                setFetching(true);
                try {
                    const blog = await getMyBlogById(blogId);
                    setFormData({
                        title: blog.title,
                        pageTitle: blog.pageTitle,
                        excerpt: blog.excerpt,
                        content: blog.content,
                        coverImage: blog.coverImage,
                        tags: blog.tags.map(t => t.name).join(", "),
                        status: blog.status
                    });
                } catch (err: any) {
                    toast.error("Failed to fetch blog for editing: " + err.message);
                } finally {
                    setFetching(false);
                }
            };
            fetchBlog();
        }
    }, [blogId]);

    if (!hydrated || !user || fetching) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map(t => t.trim())
                .filter(Boolean);

            if (blogId) {
                await updateMyBlog(blogId, {
                    ...formData,
                    tags: tagsArray
                });
            } else {
                await createBlog({
                    ...formData,
                    tags: tagsArray
                });
            }

            toast.success(`Blog post ${blogId ? 'updated' : 'created'} successfully!`);
            setTimeout(() => {
                router.push("/dashboard/blogs");
            }, 1000);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${blogId ? 'update' : 'create'} blog post`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="left-0 right-0 min-h-screen bg-gray-50/50 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/blogs" 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-bold">Write new post</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/dashboard/blogs"
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Post
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-full mx-auto px-8 pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">


                    <div className="grid grid-cols-1 gap-y-8 items-start">
                        {/* Part 1: Left Column (Metadata) */}
                        <div className="col-span-1 space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-4">Post Settings</h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                        <Type className="h-3 w-3 mr-2 text-black" />
                                        Main Title
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Enter a catchy title..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                        <Globe className="h-3 w-3 mr-2 text-black" />
                                        URL Slug
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="my-awesome-post"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm font-mono"
                                        value={formData.pageTitle}
                                        onChange={(e) => setFormData({...formData, pageTitle: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                    />
                                    <p className="text-[10px] text-gray-400 pl-1">Unique identifier for the URL.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                        <ImageIcon className="h-3 w-3 mr-2 text-black" />
                                        Cover Image URL
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                        <Hash className="h-3 w-3 mr-2 text-black" />
                                        Tags
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="tech, news, guide..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                                        <Lock className="h-3 w-3 mr-2 text-black" />
                                        Publication Status
                                    </label>
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'draft'})}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                formData.status === 'draft' 
                                                    ? "bg-white text-black shadow-sm" 
                                                    : "text-gray-400 hover:text-gray-600"
                                            }`}
                                        >
                                            Draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'published'})}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                formData.status === 'published' 
                                                    ? "bg-black text-white shadow-sm" 
                                                    : "text-gray-400 hover:text-gray-600"
                                            }`}
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                        <FileText className="h-3 w-3 mr-2" />
                                        Quick Excerpt
                                    </label>
                                    <textarea 
                                        placeholder="Summarize your story in a few sentences..."
                                        className="w-full px-6 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm min-h-[120px] resize-none leading-relaxed"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Part 2: Right Column (Content) */}
                        <div className="col-span-1 lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
                                <div className="space-y-4 pt-4 ">
                                    <label className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                        <FileText className="h-3 w-3 mr-2" />
                                        Article Content
                                    </label>
                                    <TrueTextEditor 
                                        content={formData.content}
                                        setContent={(newContent) => setFormData({...formData, content: newContent})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
