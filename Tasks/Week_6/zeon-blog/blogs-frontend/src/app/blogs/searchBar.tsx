"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Search, Tag } from "lucide-react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("query") ?? "");
    const [tag, setTag] = useState(searchParams.get("tag") ?? "");

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        
        if (query.trim()) {
            params.set("query", query.trim());
        } else {
            params.delete("query");
        }

        if (tag.trim()) {
            params.set("tag", tag.trim());
        } else {
            params.delete("tag");
        }

        params.delete("page"); // reset pagination on new search
        router.push(`/blogs?${params.toString()}`);
    }

    return (
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    value={query}
                    placeholder="Search by title or content..."
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-400 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-white/10" 
                />
            </div>
            
            <div className="relative flex-1 md:max-w-[300px]">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    value={tag}
                    placeholder="Filter by #tag"
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded-xl border border-gray-400 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-white/10" 
                />
            </div>

            <button 
                type="submit"
                className="px-6 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 text-sm"
            >
                Search
            </button>
        </form>
    );
}
