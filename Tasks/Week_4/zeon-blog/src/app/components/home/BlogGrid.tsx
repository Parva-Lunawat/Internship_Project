import { getAllPublishedPosts } from "@/src/lib/postsZeon";
import BlogCard from "../blogs/BlogCard";

export default function BlogGrid() {
    const posts = getAllPublishedPosts().slice(0, 6);

    return (
        <section>
            <header className="space-y-2 pb-6">
                <h1 className="text-3xl font-bold">Blogs</h1>
                <p className="text-gray-600 italic font-bold">The MOST Recent Blogs!!!</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <BlogCard key={post.pageTitle} post={post} />
                ))}
            </div>
        </section>
    );
}
