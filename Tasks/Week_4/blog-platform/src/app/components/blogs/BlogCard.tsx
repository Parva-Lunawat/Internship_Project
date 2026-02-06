import Link from "next/link";
import type { posts } from "@/lib/postsZeon";

type Props = {
    post: posts;
};

export default function BlogCard({ post }: Props) {
    return (
        <div className="flex items-start justify-between gap-4 px-4 py-4 border rounded-xl">
            <div>
                <div>
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="mt-1 text-base text-gray-600">{post.excerpt}</p>

                    <div className="m-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="border rounded-full bg-gray-100 px-4 text-xs text-gray-700"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>


            <div className="flex flex-col justify-between">
                <time className="text-xs text-gray-500">{post.publishedAt}</time>
                <Link
                    href={`/blogs/${post.pageTitle}`}
                    className="rounded-full border text-center zinc"
                > Click
                </Link>
            </div>
        </div>
    );
}
