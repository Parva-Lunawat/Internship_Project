const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');
const DEFAULT_AVATAR =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#e5e7eb"/><circle cx="48" cy="36" r="16" fill="#9ca3af"/><path d="M20 82c4-18 18-28 28-28s24 10 28 28" fill="#9ca3af"/></svg>`,
    );

/**
 * Resolves a potentially relative image URL to an absolute one using the backend base URL.
 * Falls back to a default avatar if the path is null or empty.
 */
export function resolveImageUrl(path: string | null | undefined): string {
    if (!path) return DEFAULT_AVATAR;
    
    // If it's already an absolute URL (starts with http), return as is
    if (path.startsWith('http')) return path;
    
    // Ensure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${BACKEND_BASE}${normalizedPath}`;
}
