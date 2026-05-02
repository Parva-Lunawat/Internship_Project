export type BlogAuthor = {
    id: string;
    name: string;
    avatar: string | null;
};

export type BlogTags = {
    id: string;
    name: string;
};

export type BlogPost = {
    id: string;
    pageTitle: string;
    title: string;
    excerpt: string;
    coverImage: string;
    content: string;
    tags: BlogTags[];
    publishedAt: string | null;
    status: 'draft' | 'published';
    commentCount?: number;
    author: BlogAuthor;
    createdAt: string;
    updatedAt: string;
};

export type BlogsApiResponse = {
    blogs: BlogPost[];
    meta: {
        totalBlogs: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
};

export type DeleteBlogResponse = {
    deleted: true;
    id: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const formatDate = (date: string | null) => date ? new Date(date).toISOString().split('T')[0] : null;

function extractErrorMessage(errorData: unknown): string | null {
    if (!errorData || typeof errorData !== "object") {
        return null;
    }

    const payload = errorData as { message?: unknown; error?: { message?: unknown } };
    const candidate = payload.message ?? payload.error?.message;

    if (Array.isArray(candidate)) {
        return candidate.join(", ");
    }

    return typeof candidate === "string" ? candidate : null;
}

export class ApiRequestError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "ApiRequestError";
    }
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            const message = extractErrorMessage(errorData);
            if (message) errorMessage = message;
        } catch {
            // Fallback to status text
        }
        throw new ApiRequestError(response.status, errorMessage);
    }

    const data = await response.json();
    return data;
}

// Get all published blogs
export async function getPublishedBlogs(params: { page: number; pageSize: number; query?: string; tag?: string; }): Promise<BlogsApiResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page));
    searchParams.set('pageSize', String(params.pageSize));
    if (params.query?.trim()) searchParams.set('query', params.query.trim());
    if (params.tag?.trim()) searchParams.set('tag', params.tag.trim());
    const response = await fetch(`${API_BASE_URL}/blogs?${searchParams.toString()}`, { method: 'GET', cache: 'no-store' });
    const payload = await parseResponse<BlogsApiResponse>(response);
    return {
        ...payload,
        blogs: payload.blogs.map((blog: BlogPost) => ({
            ...blog,
            publishedAt: formatDate(blog.publishedAt),
        })),
    };
}

export async function getPublishedPostByPageTitle(pageTitle: string): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blogs/${pageTitle}`, { method: 'GET', cache: 'no-store' });
    const payload = await parseResponse<BlogPost>(response);
    return {
        ...payload,
        publishedAt: formatDate(payload.publishedAt),
    };
}

// Get current user's blogs
export async function getMyBlogs(params?: { page?: number; pageSize?: number; query?: string; tag?: string; status?: 'draft' | 'published'; }): Promise<BlogsApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.query?.trim()) searchParams.set('query', params.query.trim());
    if (params?.tag?.trim()) searchParams.set('tag', params.tag.trim());
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const url = queryString
        ? `${API_BASE_URL}/blogs/me?${queryString}`
        : `${API_BASE_URL}/blogs/me`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    });

    const payload = await parseResponse<BlogsApiResponse>(response);
    return {
        ...payload,
        blogs: payload.blogs.map((blog: BlogPost) => ({
            ...blog,
            publishedAt: formatDate(blog.publishedAt),
        })),
    };
}

export async function getMyBlogById(blogId: string): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blogs/me/${blogId}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
    });

    const payload = await parseResponse<BlogPost>(response);
    return {
        ...payload,
        publishedAt: formatDate(payload.publishedAt),
    };
}

export async function createBlog(blogData: {
    pageTitle: string; title: string; excerpt: string;
    content: string; coverImage: string; tags: string[]; status: 'draft' | 'published';
}): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
        credentials: 'include',
        cache: 'no-store',
    });

    const payload = await parseResponse<BlogPost>(response);
    return {
        ...payload,
        publishedAt: formatDate(payload.publishedAt),
    };
}

export async function updateMyBlog(
    blogId: string,
    blogData: Partial<{
        pageTitle: string; title: string; excerpt: string;
        content: string; coverImage: string; tags: string[]; status: 'draft' | 'published';
    }>,
): Promise<BlogPost> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
        credentials: 'include',
        cache: 'no-store',
    });
    const payload = await parseResponse<BlogPost>(response);
    return {
        ...payload,
        publishedAt: formatDate(payload.publishedAt),
    };
}

export async function deleteMyBlog(
    blogId: string,
): Promise<DeleteBlogResponse> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
    });

    return parseResponse<DeleteBlogResponse>(response);
}
