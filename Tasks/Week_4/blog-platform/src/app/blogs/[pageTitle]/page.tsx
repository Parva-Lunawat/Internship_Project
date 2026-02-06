import { getPostsBypageTitle } from "@/lib/postsZeon";
import { notFound } from "next/navigation";

type pageParams = {
    params: Promise<{ pageTitle: string }>;
}

export default async function Page({ params }: pageParams) {
    const { pageTitle } = await params;
    const post = getPostsBypageTitle(pageTitle);
    if (!post) notFound();

    return (
        <article className= "prose max-w-none" >
            <h1>{ post.title } </h1>
            <p className = "text-sm text-gray-500" > Published: { post.publishedAt } </p>
            < p > { post.content } </p>
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