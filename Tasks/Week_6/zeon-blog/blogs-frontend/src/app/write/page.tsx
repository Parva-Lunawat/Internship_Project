"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../Redux/selector-functions/authSelector";
import { createBlog, updateMyBlog, getMyBlogById } from "@/src/lib/api/blogsApi";
import { 
    Save, 
    Image as ImageIcon, 
    Type, 
    FileText, 
    Hash, 
    Globe, 
    Lock, 
    Loader2,
    ArrowLeft,
    Clock
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import TrueTextEditor from "../components/blogs/trueTextEditor";
// import RichTextEditor from "../components/blogs/RichTextEditor";

function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) {
        return err.message;
    }
    return fallback;
}

function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "";
    return date.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function readingTime(content: string) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
}

export default function WriteBlogPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-black dark:text-sky-200" />
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
        featuredImageAlt: "",
        tags: "",
        status: "draft" as "draft" | "scheduled" | "published",
        scheduledPublishAt: "",
        visibility: "public" as "public" | "unlisted",
        metaTitle: "",
        metaDescription: "",
        canonicalPath: "",
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
                        featuredImageAlt: blog.featuredImageAlt ?? "",
                        tags: blog.tags.map(t => t.name).join(", "),
                        status: blog.status,
                        scheduledPublishAt: toDateTimeLocal(blog.scheduledPublishAt),
                        visibility: blog.visibility ?? "public",
                        metaTitle: blog.metaTitle ?? "",
                        metaDescription: blog.metaDescription ?? "",
                        canonicalPath: blog.canonicalPath ?? "",
                    });
                } catch (err: unknown) {
                    toast.error(`Failed to fetch blog for editing: ${getErrorMessage(err, "Unknown error")}`);
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
                <Loader2 className="h-10 w-10 animate-spin text-black dark:text-sky-200" />
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
            if (formData.status === "scheduled" && !formData.scheduledPublishAt) {
                toast.error("Choose a future publish time before scheduling.");
                return;
            }
            const payload = {
                ...formData,
                scheduledPublishAt: formData.status === "scheduled" ? toIsoOrNull(formData.scheduledPublishAt) : null,
                featuredImageAlt: formData.featuredImageAlt || null,
                metaTitle: formData.metaTitle || null,
                metaDescription: formData.metaDescription || null,
                canonicalPath: formData.canonicalPath || null,
                tags: tagsArray,
            };

            if (blogId) {
                await updateMyBlog(blogId, {
                    ...payload,
                });
            } else {
                await createBlog({
                    ...payload,
                });
            }

            toast.success(`Blog post ${blogId ? 'updated' : 'created'} successfully!`);
            setTimeout(() => {
                router.push("/dashboard/blogs");
            }, 1000);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, `Failed to ${blogId ? "update" : "create"} blog post`));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="left-0 right-0 min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/80 to-gray-100 pb-20 dark:from-[#081124] dark:via-[#0b152b] dark:to-[#050a16]">
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-slate-700/70 dark:bg-[#07101f]/85">
                <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/dashboard/blogs" 
                            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-sky-100" />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-sky-50">Write new post</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/dashboard/blogs"
                            className="px-4 py-2 text-sm font-bold text-gray-500 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-sky-200"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center rounded-xl bg-gray-900 px-6 py-2 text-sm font-bold text-white transition-all active:scale-95 hover:bg-black disabled:opacity-50 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
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
                        <div className="col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#0c1a33]/95 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                            <h2 className="border-b border-gray-200 pb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:border-slate-700 dark:text-sky-200/70">Post Settings</h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <Type className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Main Title
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Enter a catchy title..."
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <Globe className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        URL Slug
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="my-awesome-post"
                                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.pageTitle}
                                        onChange={(e) => setFormData({...formData, pageTitle: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                    />
                                    <p className="pl-1 text-[10px] text-gray-400 dark:text-slate-400">Unique identifier for the URL.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <ImageIcon className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Cover Image URL
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <ImageIcon className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Featured Image Alt Text
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Describe the featured image for accessibility"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.featuredImageAlt}
                                        onChange={(e) => setFormData({...formData, featuredImageAlt: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <Hash className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Tags
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="tech, news, guide..."
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <Lock className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Publication Status
                                    </label>
                                    <div className="flex gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-1 dark:border-slate-600 dark:bg-[#09162d]">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'draft'})}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                formData.status === 'draft' 
                                                    ? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-sky-100" 
                                                    : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            Draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'scheduled'})}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                formData.status === 'scheduled'
                                                    ? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-sky-100"
                                                    : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            Schedule
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, status: 'published'})}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                formData.status === 'published'
                                                    ? "bg-black text-white shadow-sm dark:bg-sky-500 dark:text-slate-950" 
                                                    : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                                {formData.status === "scheduled" ? (
                                    <div className="space-y-2">
                                        <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                            <Clock className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                            Scheduled Publish Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                            value={formData.scheduledPublishAt}
                                            onChange={(e) => setFormData({...formData, scheduledPublishAt: e.target.value})}
                                        />
                                    </div>
                                ) : null}
                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
                                        <Globe className="mr-2 h-3 w-3 text-black dark:text-sky-300" />
                                        Visibility
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({...formData, visibility: e.target.value as "public" | "unlisted"})}
                                    >
                                        <option value="public">Public</option>
                                        <option value="unlisted">Unlisted</option>
                                    </select>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-slate-700 dark:bg-[#09162d] dark:text-slate-300">
                                    Estimated reading time: <strong>{readingTime(formData.content)} min</strong>
                                </div>
                                <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-[#09162d]">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">SEO</h3>
                                    <input
                                        type="text"
                                        placeholder="Meta title"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#071224] dark:text-sky-50"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                                    />
                                    <textarea
                                        placeholder="Meta description"
                                        className="min-h-[90px] w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#071224] dark:text-sky-50"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                                    />
                                    <input
                                        type="text"
                                        placeholder="/blogs/custom-canonical-path"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#071224] dark:text-sky-50"
                                        value={formData.canonicalPath}
                                        onChange={(e) => setFormData({...formData, canonicalPath: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-300">
                                        <FileText className="mr-2 h-3 w-3" />
                                        Quick Excerpt
                                    </label>
                                    <textarea 
                                        placeholder="Summarize your story in a few sentences..."
                                        className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-300 bg-white px-6 py-4 text-sm leading-relaxed transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-slate-600 dark:bg-[#09162d] dark:text-sky-50 dark:placeholder:text-slate-400 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Part 2: Right Column (Content) */}
                        <div className="col-span-1 lg:col-span-2 space-y-6">
                            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#0c1a33]/95 dark:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                                <div className="space-y-4 pt-4 ">
                                    <label className="flex items-center pl-1 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-300">
                                        <FileText className="mr-2 h-3 w-3" />
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
