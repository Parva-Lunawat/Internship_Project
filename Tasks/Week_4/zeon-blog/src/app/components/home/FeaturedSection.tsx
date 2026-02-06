import { getAllPublishedPosts } from "@/src/lib/postsZeon";
import CompactCard from "../blogs/SmallBlogCards";
import BigFeaturedCard from "../blogs/BigBlogCards";

// 1st version
// export default function FeaturedPost() {
//   const posts = getAllPublishedPosts();
//   const [featured, ...rest] = posts;

//   return (
//     <div>
//       <h1 className="text-xl font-bold py-2">Recently Featured Articles</h1>
//       <section className="grid gap-6 lg:grid-cols-3">
//         <div className="lg:col-span-2">
//           <BlogCard post={featured} />
//         </div>

//         <div className="space-y-4">
//           {rest.slice(0, 3).map((post) => (
//             <BlogCard key={post.pageTitle} post={post} />
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

// 2nd version
// function BigFeatureCard({ post }: { post: posts }) {
//   const img = post.coverImage;
//   const author = post.author.name;

//   return (
//     <article className="border ">
//       <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={img}
//           alt={post.title}
//         />
//       </div>

//       <div className="p-6">
//         <p className="text-xs text-gray-500">
//           {author} • {post.publishedAt}
//         </p>

//         <h3 className="mt-2 text-xl font-semibold leading-snug">
//           {post.title}
//         </h3>

//         <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
//         <div className="flex justify-between ">
//         <div className="mt-auto flex flex-wrap gap-2 pt-2">
//           {post.tags.map((tag) => (
//             <span key={tag} className="border rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
//               #{tag}
//             </span>
//           ))}
//         </div>
//         <Link
//           href={`/blogs/${post.pageTitle}`}
//           className="text-center rounded-full border px-4 py-1 text-sm hover:bg-gray-50 transition-colors"
//         >Click</Link>
//       </div>
//       </div>
//     </article>
//   );
// }

// export default function FeaturedPost() {
//   const posts = getAllPublishedPosts();
//   const [featured, ...rest] = posts;
//   if (!featured) return null;

//   return (
//     <section className="space-y-6">
//       <div className="text-lg font-semibold">Recent Blogs</div>
//       <div className="grid gap-6 lg:grid-cols-3 items-stretch">
//         <div className="lg:col-span-2">
//           <BigFeatureCard post={featured} />
//         </div>
//         <div className="flex flex-col gap-4">
//           {rest.slice(0, 3).map((post) => (
//             <BlogCard key={post.pageTitle} post={post} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


export default function FeaturedPost() {
  const posts = getAllPublishedPosts();
  const [featured, ...rest] = posts;
  if (!featured) return null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Featured Blogs</h1>
        <p className="text-gray-600 italic font-bold">The HOTTEST Posts out there!!!</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2">
          <BigFeaturedCard post={featured} />
        </div>
        <div className="flex flex-col gap-4">
          {rest.slice(0, 3).map((post) => (
            <CompactCard key={post.pageTitle} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}