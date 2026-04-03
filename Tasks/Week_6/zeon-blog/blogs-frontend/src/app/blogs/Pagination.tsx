import Link from "next/link";
// import { useSearchParams } from "next/navigation";

type Props = {
    currentPage: number;
    totalPages: number;
    basePath: string;
    extraParams?: {
        query?: string;
        tag?: string;
        status?: string;
    };
};

function hrefBuilder(
    basePath: string, page: number, extraParams?: { query?: string; tag?: string; status?: string }
) {
    const search = new URLSearchParams();
    search.set("page", String(page)); 
    if (extraParams?.query) search.set("query", extraParams?.query);
    if (extraParams?.tag) search.set("tag", extraParams?.tag);   
    if (extraParams?.status) search.set("status", extraParams?.status);

    return `${basePath}?${search.toString()}`;
}

export default function Pagination({ currentPage, totalPages, basePath, extraParams }: Props) {
    if (totalPages <= 1) return null;
    return (
        <nav className="flex items-center justify-between pt-6 text-sm">
            <Link href={hrefBuilder(basePath, Math.max(1, currentPage - 1), extraParams)} scroll={false}
                className={`w-24 text-center rounded-xl border px-3 py-2 ${currentPage === 1
                    ? "pointer-events-none text-gray-400"
                    : "hover:bg-gray-50"
                    }`}
            >Previous</Link>
            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isActive = currentPage === page;
                    return (
                        <Link
                            key={page} scroll={false}
                            href={hrefBuilder(basePath, page, extraParams)}
                            className={`h-9 w-9 rounded-xl text-center leading-9 ${isActive
                                ? "bg-gray-900 text-white"
                                : "border hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>
            <Link href={hrefBuilder(basePath, Math.min(totalPages, currentPage + 1), extraParams)} scroll={false}
                className={`w-24 text-center rounded-xl border px-3 py-2 ${currentPage === totalPages
                    ? "pointer-events-none text-gray-400"
                    : "hover:bg-gray-50"
                    }`}
            >Next</Link>
        </nav>
    );
}