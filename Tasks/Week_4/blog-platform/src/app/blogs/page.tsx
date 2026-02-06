import BlogCard from "../components/blogs/BlogCard";
import { getAllPublishedPosts } from "@/lib/postsZeon";

export default function BlogPage() {
  const posts = getAllPublishedPosts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blogs</h1>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <BlogCard key={post.pageTitle} post={post} />
        ))}
      </div>
    </div>
  );
}
