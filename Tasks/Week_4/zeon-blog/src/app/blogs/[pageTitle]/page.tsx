import { getPostsBypageTitle } from "@/src/lib/postsZeon";
import { notFound } from "next/navigation";

type pageParams = {
    params: Promise<{ pageTitle: string }>;
}

export default async function Page({ params }: pageParams) {
    const { pageTitle } = await params;
    const post = getPostsBypageTitle(pageTitle);
    if (!post) notFound();

    return (
        <article className="flex flex-col gap-6 prose max-w-none m-10" >
            <div className="flex flex-col gap-4 pb-4">
                <h1 className="text-4xl font-bold">{post.title}</h1>
                <p className="text-lg italic">{post.excerpt}</p>
            </div>
            <div className="relative overflow-hidden border">
                <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="text-white flex content-start gap-5 italic">
                            <div>
                                <p className="text-base opacity-90">Written by</p>
                                <p className="text-xl font-bold">{post.author.name}</p>
                            </div>
                            <div>
                                <p className="text-base opacity-90">Published on</p>
                                <p className="text-xl font-bold">{post.publishedAt}</p>
                            </div>
                        </div>
                        <div>
                            <img src={post.author.avatar}
                            className="h-22 w-22 rounded-full border-2 border-white"></img>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-base leading-loose text-justify">
                <p> {post.content} </p>
            </div>
        </article>
    );
}

// Before Next15
// import { getPostsBypageTitle } from "@/lib/postsZeon";
// import { notFound } from "next/navigation";

// type pageParams = {
//     params: { pageTitle: string };
// }

// export default function Page({ params }: pageParams) {
//     const post = getPostsBypageTitle(params.pageTitle);
//     if (!post) return notFound;

//     return (
//         <article className= "prose max-w-none" >
//             <h1>{ post.title } </h1>
//             <p className = "text-sm text-gray-500" > Published: { post.publishedAt } </p>
//             < p > { post.content } </p>
//         </article>
//     );
// }

// Why the update? (Benefits)
// Faster "Time to First Byte" (TTFB): i.e. stream instantly and not wait for block arrival
// Partial Prerendering (PPR): static parts of page (like a sidebar) are pre-built at compile time, while dynamic parts (like a specific blog post title) are fetched on-demand.
// Smarter Caching
// async function Page ({params})
// const anything = (await params).content;