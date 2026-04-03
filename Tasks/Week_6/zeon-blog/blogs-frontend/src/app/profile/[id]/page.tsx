"use client";

import { useEffect, useState } from "react";
import { User, getUserById } from "@/src/lib/api/usersApi";
import { useParams } from "next/navigation";
import { Loader2, Mail, Calendar, User as UserIcon, Shield, FileText } from "lucide-react";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      try {
        const data = await getUserById(id as string);
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id]);

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
        </div>
    );
  }

  if (error || !user) {
    return (
        <div className="py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-8">{error || "The user you are looking for does not exist."}</p>
            <a href="/" className="inline-block px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
                Back to Home
            </a>
        </div>
    );
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-gray-100">
        <div className="h-48 w-48 rounded-3xl bg-gray-50 border overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-[1.02]">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-20 w-20 text-gray-200" />
          )}
        </div>
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-4 text-gray-500">
                <span className="flex items-center text-sm font-bold uppercase tracking-widest text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <Shield className="h-3.5 w-3.5 mr-2" />
                  {user.role}
                </span>
                {user.email && (
                  <span className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </span>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-8 pt-4">
              <div className="flex flex-col">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Posts</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Followers</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8">
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs font-bold text-gray-400 uppercase">Following</span>
              </div>
          </div>
        </div>
        <div className="pt-4">
            <button className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95">
                Follow
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">About</h2>
                <p className="text-gray-600 leading-relaxed text-lg pb-4 border-b border-gray-50 italic">
                    {user.isProfileComplete 
                        ? "Passionate story teller and tech enthusiast. Regular contributor to Zeon Blogs. Writing about the future of web and human experience." 
                        : "This user hasn't completed their profile yet."}
                </p>
            </section>
        </div>
        
        <div className="space-y-8">
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/30 space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metadata</h3>
                <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-4 text-gray-400" />
                        <span className="text-sm font-medium">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recent"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <FileText className="h-5 w-5 mr-4 text-gray-400" />
                        <span className="text-sm font-medium underline cursor-pointer hover:text-black">View Publications</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
