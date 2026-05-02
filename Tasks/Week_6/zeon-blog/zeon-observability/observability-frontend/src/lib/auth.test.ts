import { describe, expect, it } from "vitest";

import { isAdminToken } from "./auth";

function buildToken(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("isAdminToken", () => {
  it("accepts admin token with valid expiry", () => {
    const token = buildToken({
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    expect(isAdminToken(token)).toBe(true);
  });

  it("rejects non-admin role", () => {
    const token = buildToken({
      role: "writer",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    expect(isAdminToken(token)).toBe(false);
  });
});
