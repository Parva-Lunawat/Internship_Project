import { MAIN_API_BASE_URL, OBS_API_BASE_URL } from "./config";

function extractMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Request failed";
  const obj = payload as
    | { error?: { message?: unknown }; message?: unknown }
    | undefined;
  const candidate = obj?.error?.message ?? obj?.message;
  if (Array.isArray(candidate)) return candidate.join(", ");
  if (typeof candidate === "string") return candidate;
  return "Request failed";
}

function friendlyError(status: number, message: string): string {
  if (status === 404 || /^Cannot\s+(GET|POST|PATCH|PUT|DELETE)\s+/i.test(message)) {
    return "That observability data is not available yet. Please refresh after the backend restarts.";
  }
  if (status === 401) return "Please sign in again to view observability data.";
  if (status === 403) return "Your account does not have access to this observability view.";
  if (status >= 500) return "The observability service is having trouble. Please try again shortly.";
  return message || "Request failed. Please try again.";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let msg = `Request failed with status ${response.status}`;
    try {
      msg = extractMessage(await response.json());
    } catch {
      // noop
    }
    throw new Error(friendlyError(response.status, msg));
  }
  return response.json() as Promise<T>;
}

export async function loginMainBackend(input: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${MAIN_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJson<{
    data: {
      accessToken: string;
      user: {
        role: string;
        email: string;
        name: string;
      };
    };
  }>(response);
}

export async function fetchObservability<T>(
  token: string,
  path: string,
): Promise<T> {
  const base = OBS_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<T>(response);
}
