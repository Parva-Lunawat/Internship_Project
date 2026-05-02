export const MAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_MAIN_API_BASE_URL || "http://localhost:5000/api/v1";

export const OBS_API_BASE_URL =
  process.env.NEXT_PUBLIC_OBS_API_BASE_URL || "http://localhost:5100/api/v1";

export const OBS_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_OBS_POLL_MS || 5000,
);

export const TOKEN_STORAGE_KEY = "obs_admin_token";
