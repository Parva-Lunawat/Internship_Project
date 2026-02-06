"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("query") ?? "");
    function submit(e: React.SubmitEvent) {
        e.preventDefault();
        const searchBar = new URLSearchParams(searchParams.toString());
        query ? searchBar.set("query", query) : searchBar.delete("query");
        searchBar.delete("page"); // reset pagination on new search
        router.push(`/blogs?${searchBar.toString()}`);
        setQuery("");
    }

    return (
        <form onSubmit={submit} className="flex gap-2">
            <input
                value={query}
                placeholder="Search Blogs"
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border px-4 py-2" />
            <button className="rounded-lg border px-4 py-2">Search</button>
        </form>
    );

}