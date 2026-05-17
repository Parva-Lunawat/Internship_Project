"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, getUserById } from "@/src/lib/api/usersApi";
import { Loader2, Mail, Calendar, User as UserIcon, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-sky-200" />
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}

function PublicProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.trim() || "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        setError("Missing profile id.");
        setLoading(false);
        return;
      }

      try {
        const data = await getUserById(id);
        setUser(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black dark:text-sky-200" />
        </div>
    );
  }

  if (error || !user) {
    return (
        <div className="py-20 text-center">
            <h2 className="mb-4 text-3xl font-bold">Profile Not Found</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-300">{error || "The user you are looking for does not exist."}</p>
            <Link href="/" className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-bold text-white transition-all hover:bg-black dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                Back to Home
            </Link>
        </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full space-y-12 duration-500">
      <div className="flex flex-col items-start gap-8 border-b border-gray-100 pb-12 md:flex-row dark:border-gray-800">
        <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-3xl border bg-gray-50 shadow-sm transition-transform hover:scale-[1.02] dark:border-gray-700 dark:bg-slate-900">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-20 w-20 text-gray-200 dark:text-gray-600" />
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-300">
                <span className="flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-bold uppercase tracking-widest text-black dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100">
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  {user.role}
                </span>
                {user.email && (
                  <span className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4" />
                    {user.email}
                  </span>
                )}
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4">
              <div className="flex flex-col">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Posts</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8 dark:border-gray-700">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Followers</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8 dark:border-gray-700">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">Following</span>
              </div>
          </div>
        </div>
        <div className="pt-4">
            <button className="rounded-xl bg-gray-900 px-8 py-3 font-bold text-white transition-all active:scale-95 hover:bg-black dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                Follow
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">About</h2>
                <p className="border-b border-gray-50 pb-4 text-lg italic leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-300">
                    {user.isProfileComplete
                        ? "Passionate story teller and tech enthusiast. Regular contributor to Zeon Blogs. Writing about the future of web and human experience."
                        : "This user hasn't completed their profile yet."}
                </p>
            </section>
        </div>

        <div className="space-y-8">
            <div className="space-y-6 rounded-3xl border border-gray-100 bg-gray-50/30 p-8 dark:border-gray-800 dark:bg-slate-900/70">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Metadata</h3>
                <div className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Calendar className="mr-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recent"}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FileText className="mr-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <span className="cursor-pointer text-sm font-medium underline hover:text-black dark:hover:text-sky-300">View Publications</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
