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

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let msg = `Request failed with status ${response.status}`;
    try {
      msg = extractMessage(await response.json());
    } catch {
      // noop
    }
    throw new Error(msg);
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
  const response = await fetch(`${OBS_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<T>(response);
}
