"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../../Redux/selector-functions/authSelector";
import { sessionUser } from "@/src/lib/session";
import { authLogout } from "../../Redux/actions/authActions";
import { clearSession } from "@/src/lib/session";
import ThemeToggle from "./ThemeToggle";
import { logout as apiLogout } from "@/src/lib/api/authApi";


export default function Navbar() {
  const dispatch = useAppDispatch();
  const user: sessionUser | null = useAppSelector(selectAuthUser);
  const hydrated: boolean = useAppSelector(selectAuthHydrated);
  const name = user?.name;
  
  async function onLogout() {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API failed, clearing local session fallback.", error);
    } finally {
      clearSession();
      dispatch(authLogout());
    }
  }
  
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-slate-950/90 transition-colors duration-300">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <span className="px-4 text-3xl font-semibold text-gray-900 dark:text-sky-100">Zeon Blogs</span>

        <nav className="font-semibold text-lg flex items-center px-4 gap-6 text-gray-700 dark:text-gray-200">
          <Link href="/" className="hover:text-black dark:hover:text-sky-200 transition-colors">Home</Link>
          <Link href="/blogs" className="hover:text-black dark:hover:text-sky-200 transition-colors">Blog</Link>
          {!hydrated ? null : !user ? (
            <div className="flex items-center gap-6">
              <Link href="/signup" className="rounded-xl border-2 border-gray-200 bg-white px-3 py-1 text-center transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800">Signup</Link>
              <Link href="/login" className="rounded-xl border-2 border-gray-900 bg-gray-900 px-3 py-1 text-center text-white transition-all hover:opacity-80 dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950">Log In</Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/write" className="rounded-xl border-2 border-gray-200 bg-white px-3 py-1 text-center transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800">Write a Blog</Link>
              <Link href="/dashboard" className="rounded-xl border-2 border-gray-900 bg-gray-900 px-3 py-1 text-center text-white transition-all hover:opacity-80 dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950">{name}</Link>
              <button onClick={() => void onLogout()} className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-3 py-1 text-center transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800">Logout</button>
            </div>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
