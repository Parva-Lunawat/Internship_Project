const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
export type UserRole = 'admin' | 'writer' | 'reader';

export type User = {
    id: string;
    name: string;
    email?: string; 
    avatar: string | null;
    isProfileComplete?: boolean;
    role?: UserRole;
    createdAt?: string;
    updatedAt?: string;
};

export type UsersResponse = {
    data: User[];
    meta: {
        totalUsers: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
};

export type DeleteUserResponse = {
    deleted: true;
    id: string;
};

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

// Common fetch wrapper
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(extractErrorMessage(error) || `Request failed with status ${response.status}`);
    }
    return response.json();
}

export async function getCurrentUser(): Promise<User> {
    const res = await apiFetch<{ data: User }>(`${API_BASE_URL}/users/me`, { method: 'GET' });
    return res.data;
}

export async function updateCurrentUser(data: { name?: string; email?: string; avatar?: string | null; role?: UserRole; }): Promise<User> {
    const res = await apiFetch<{ data: User }>(`${API_BASE_URL}/users/me`,{ method: 'PATCH', body: JSON.stringify(data) });
    return res.data;
}

export async function getUserById(userId: string): Promise<User> {
    const res = await apiFetch<{ data: User }>(`${API_BASE_URL}/users/${userId}`,{ method: 'GET' });
    return res.data;
}

export async function getAllUsers(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    role?: UserRole;
}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.query?.trim()) searchParams.set('query', params.query.trim());
    if (params.role) searchParams.set('role', params.role);

    const data = await apiFetch<UsersResponse>(`${API_BASE_URL}/users?${searchParams.toString()}`,{ method: 'GET', });
    return {
        data: data.data,
        meta: data.meta
    }
}

export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
    const res = await apiFetch<{ data: DeleteUserResponse }>(`${API_BASE_URL}/users/${userId}`,{ method: 'DELETE', });
    return res.data;
}
