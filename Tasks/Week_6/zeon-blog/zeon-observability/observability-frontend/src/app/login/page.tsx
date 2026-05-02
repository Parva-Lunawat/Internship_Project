"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveToken } from "@/src/lib/auth";
import { loginMainBackend } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginMainBackend({ email, password });
      if (result.data.user.role !== "admin") {
        throw new Error("Only admin users can access observability dashboard.");
      }
      saveToken(result.data.accessToken);
      router.replace("/metrics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={onSubmit}
        className="obs-card"
        style={{ width: "min(460px, 100%)" }}
      >
        <h2 style={{ marginTop: 0 }}>Observability Admin Login</h2>
        <p className="obs-muted" style={{ marginTop: -6 }}>
          Authenticate with Zeon main backend admin account.
        </p>

        <div className="obs-filters" style={{ display: "grid", gap: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="obs-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {error ? (
          <p className="obs-danger" style={{ marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
