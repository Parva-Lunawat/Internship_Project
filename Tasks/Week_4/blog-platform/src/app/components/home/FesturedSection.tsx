import BlogCard from "../blogs/BlogCard";
import { getAllPublishedPosts } from "@/lib/postsZeon";

export default function FeaturedPost() {
  const posts = getAllPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BlogCard post={featured} />
      </div>

      <div className="space-y-4">
        {rest.slice(0, 3).map((post) => (
          <BlogCard key={post.pageTitle} post={post}/>
        ))}
      </div>
    </section>
  );
}
