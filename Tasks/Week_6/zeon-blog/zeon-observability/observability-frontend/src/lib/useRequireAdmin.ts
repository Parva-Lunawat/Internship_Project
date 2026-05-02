"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, isAdminToken } from "./auth";

export function useRequireAdmin() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentToken = getToken();
    if (!isAdminToken(currentToken)) {
      router.replace("/login");
      return;
    }
    setToken(currentToken);
    setReady(true);
  }, [router]);

  return { token, ready };
}
