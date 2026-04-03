// export type posts = {
//     pageTitle: string;
//     title: string;
//     excerpt: string;
//     coverImage: string;
//     content: string;
//     tags: Array<string>;
//     publishedAt: string;
//     status: "draft" | "published";
//     // New Author Type
//     author: {
//         name: string;
//         avatar: string;
//     };
// };
export type BlogAuthor = {
    name: string;
    avatar: string | null;
};
export type posts = {
    id: string;
    pageTitle: string;
    title: string;
    excerpt: string;
    coverImage: string;
    content: string;
    tags: string[];
    publishedAt: string | null;
    status: 'draft' | 'published';
    author: BlogAuthor;
    createdAt: string;
    updatedAt: string;
};

const dummyPosts: Array<posts> = [
    // --- EXISTING POSTS (Updated with Real Content) ---

];



export function getAllPublishedPosts(): Array<posts> {
    return dummyPosts.filter((p) => p.status === "published")
        .sort((a, b) => (a.publishedAt < b.publishedAt) ? 1 : -1);
}

export function getPostsBypageTitle(pageTitle: string): posts | undefined {
    return dummyPosts.find((p) => p.pageTitle === pageTitle && p.status === "published");
}

export function paginatedPosts({ page, pageSize }: { page: number, pageSize: number }) {
    const allPosts = getAllPublishedPosts();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / pageSize);
    const start = (page - 1) * pageSize; // if start from "1" page index 
    const end = start + pageSize;
    const posts = allPosts.slice(start, end);
    return {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
    };
}

export function filteredPaginatedPosts({page, pageSize, query, tag}: 
    {page: number, pageSize: number, query: string, tag: string}) {
    let allPosts = getAllPublishedPosts();
    if (query) {
        const q = query.toLowerCase();
        allPosts = allPosts.filter((post) => 
            post.title.toLowerCase().includes(q)
        );
    }

    if (tag) {
        const t = tag.toLowerCase();
        allPosts = allPosts.filter((post) =>
            post.tags.some(tag => tag.toLowerCase() === t)
        );
    }

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const posts = allPosts.slice(start, end);

    return {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
    };
}