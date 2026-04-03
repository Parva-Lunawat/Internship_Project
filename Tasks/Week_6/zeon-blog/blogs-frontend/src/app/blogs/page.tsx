import BlogCard from "../components/blogs/BlogCard";
import Pagination from "./Pagination";
import SearchBar from "./searchBar";
import { getPublishedBlogs, BlogPost } from "@/src/lib/api/blogsApi";


type pageProp = {
  searchParams?: Promise<{
    page?: string;
    query?: string;
    tag?: string;
  }>;
};
const PAGE_SIZE = 6;

export default async function PaginatedBlogsPage({ searchParams }: pageProp) {
  const params = await searchParams;
  const currentPage = Number(params?.page ?? "1") || 1;
  const query = params?.query?.trim();
  const tag = params?.tag?.trim();
  const { blogs, meta } = await getPublishedBlogs({ page: currentPage, pageSize: PAGE_SIZE, query, tag });
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">All blog posts</h1>
        <SearchBar />
        <p className="text-gray-600">
          {query || tag
            ? `Showing results${query ? ` for "${query}"` : ""}${tag ? ` in #${tag}` : ""}`
            : "Browse everything we've published."}
        </p>
      </header>

      <div key={`${query}-${tag}-${currentPage}`}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-4">
        {blogs.length > 0 ? (
          blogs.map((post: BlogPost) => (
            <BlogCard key={post.pageTitle} post={post} />
          ))) : (
          <p className="col-span-full py-10 text-center text-gray-500">
            No posts found.
          </p>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={meta.totalPages}
        basePath="/blogs"
        extraParams={{ query, tag }}
      />
    </div>
  );
}

// export function BlogsPage(AllPost: Array<posts>) {
//   return (
//     <div className="space-y-6">
//       <header className="space-y-2">
//         <h1 className="text-3xl font-bold">All blog posts</h1>
//         <p className="text-gray-600">Browse everything we've published.</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-4">
//         {AllPost.map((post: posts) => (
//           <BlogCard key={post.pageTitle} post={post} />
//         ))}
//       </div>
//     </div>
//   );
// }