export type UserRole = 'admin' | 'writer' | 'reader';

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: UserRole;
    isProfileComplete: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthResponse = {
    accessToken: string;
    user: AuthUser;
};

export type LogoutResponse = {
    loggedOut: true;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

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

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include', // required for cookie auth
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

export async function signup(data: { name: string; email: string; password: string; confirmPassword: string; }): Promise<AuthResponse> {
    const res = await apiFetch<{ data: AuthResponse }>(`${API_BASE_URL}/auth/signup`, { method: 'POST', body: JSON.stringify(data) });
    return res.data;
}

export async function login(data: { email: string; password: string; }): Promise<AuthResponse> {
    const res = await apiFetch<{ data: AuthResponse }>(`${API_BASE_URL}/auth/login`, { method: 'POST', body: JSON.stringify(data) });
    return res.data;
}

export async function getSelf(): Promise<AuthUser> {
    const res = await apiFetch<{ data: AuthUser }>(`${API_BASE_URL}/auth/self`, { method: 'GET' });
    return res.data;
}

export async function logout(): Promise<LogoutResponse> {
    const res = await apiFetch<{ data: LogoutResponse }>(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    return res.data;
}
