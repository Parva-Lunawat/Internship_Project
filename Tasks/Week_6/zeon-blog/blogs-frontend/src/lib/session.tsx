export type sessionUser = {
    name: string;
    email: string;
    avatar: string | null;
    role: "admin" | "writer" | "reader";
    isProfileComplete: boolean;
    createdAt?: string;
    loginTimestamp?: number;
}
const key = "ZEON_USER";
export function setSession(user: sessionUser) {
    localStorage.setItem(key, JSON.stringify(user));
}

export function getSession(): sessionUser | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as sessionUser;
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(key);
}
