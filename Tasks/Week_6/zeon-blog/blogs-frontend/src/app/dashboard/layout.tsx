"use client";

import DashboardNav from "../components/layout/DashboardNav";
import { useAppSelector } from "../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../Redux/selector-functions/authSelector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectAuthUser);
  const hydrated = useAppSelector(selectAuthHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/login");
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-900 border-t-transparent dark:border-gray-200 dark:border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2 dark:text-gray-400">Manage your account, blogs, and settings.</p>
      </header>
      
      <DashboardNav />
      
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  );
}
