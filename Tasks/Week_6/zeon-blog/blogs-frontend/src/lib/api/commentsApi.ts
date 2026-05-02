const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export type CommentAuthor = {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  roleLabel?: string | null;
};

export type BlogComment = {
  id: string;
  blogId: string;
  parentCommentId: string | null;
  content: string;
  isDeleted: boolean;
  moderationStatus?: 'visible' | 'review' | 'hidden';
  isPostAuthor?: boolean;
  isAdmin?: boolean;
  roleLabel?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: CommentAuthor | null;
};

export type CommentsResponse = {
  comments: BlogComment[];
  meta: {
    totalComments: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

function extractErrorMessage(errorData: unknown): string | null {
  if (!errorData || typeof errorData !== 'object') return null;
  const payload = errorData as { message?: unknown; error?: { message?: unknown } };
  const candidate = payload.message ?? payload.error?.message;
  if (Array.isArray(candidate)) return candidate.join(', ');
  return typeof candidate === 'string' ? candidate : null;
}

function friendlyCommentError(status: number, message: string): string {
  if (status === 401) return 'Please sign in before changing comments.';
  if (status === 403) return 'You do not have permission to change this comment.';
  if (status === 404) return 'That comment is no longer available.';
  if (status === 400 && message) return message;
  if (status >= 500) return 'Comments are temporarily unavailable. Please try again shortly.';
  return 'Unable to complete the comment action. Please try again.';
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      message = extractErrorMessage(await response.json()) ?? message;
    } catch {
      // keep fallback
    }
    throw new Error(friendlyCommentError(response.status, message));
  }
  return response.json() as Promise<T>;
}

export async function getComments(blogId: string, params?: { page?: number; pageSize?: number; sort?: 'asc' | 'desc'; parentCommentId?: string }) {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  if (params?.sort) search.set('sort', params.sort);
  if (params?.parentCommentId) search.set('parentCommentId', params.parentCommentId);
  const query = search.toString();
  const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments${query ? `?${query}` : ''}`, {
    method: 'GET',
    cache: 'no-store',
  });
  return parseResponse<CommentsResponse>(response);
}

export async function createComment(blogId: string, input: { content: string; parentCommentId?: string }) {
  const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify(input),
  });
  return parseResponse<BlogComment>(response);
}

export async function updateComment(commentId: string, input: { content: string }) {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify(input),
  });
  return parseResponse<BlogComment>(response);
}

export async function deleteComment(commentId: string) {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
  });
  return parseResponse<{ deleted: true; id: string }>(response);
}
