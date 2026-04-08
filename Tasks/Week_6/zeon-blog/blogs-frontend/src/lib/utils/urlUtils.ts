const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');

/**
 * Resolves a potentially relative image URL to an absolute one using the backend base URL.
 * Falls back to a default avatar if the path is null or empty.
 */
export function resolveImageUrl(path: string | null | undefined): string {
    if (!path) return "/default-avatar.png";
    
    // If it's already an absolute URL (starts with http), return as is
    if (path.startsWith('http')) return path;
    
    // Ensure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${BACKEND_BASE}${normalizedPath}`;
}
