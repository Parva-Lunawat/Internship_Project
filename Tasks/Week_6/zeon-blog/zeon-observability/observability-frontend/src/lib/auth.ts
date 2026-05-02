import { TOKEN_STORAGE_KEY } from "./config";

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
};

function decodePayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isAdminToken(token: string | null): boolean {
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload || payload.role !== "admin") return false;
  if (payload.exp && Date.now() / 1000 >= payload.exp) return false;
  return true;
}
