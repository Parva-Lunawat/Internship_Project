"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../../Redux/selector-functions/authSelector";
import { sessionUser } from "@/src/lib/session";
import { authLogout } from "../../Redux/actions/authActions";
import { clearSession } from "@/src/lib/session";
import ThemeToggle from "./ThemeToggle";


export default function Navbar() {
  const dispatch = useAppDispatch();
  const user: sessionUser | null = useAppSelector(selectAuthUser);
  const hydrated: boolean = useAppSelector(selectAuthHydrated);
  const name = user?.name;
  
  function onLogout() {
    clearSession();
    dispatch(authLogout());
  }
  
  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <span className="px-4 text-3xl font-semibold text-gray-900 dark:text-white">Zeon Blogs</span>

        <nav className="font-semibold text-lg flex items-center px-4 gap-6 text-gray-700 dark:text-gray-200">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <Link href="/blogs" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          {!hydrated ? null : !user ? (
            <div className="flex items-center gap-6">
              <Link href="/signup" className="border-2 text-center px-3 py-1 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Signup</Link>
              <Link href="/login" className="border-2 border-black dark:border-white text-center px-3 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all">Log In</Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/write" className="border-2 text-center px-3 py-1 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Write a Blog</Link>
              <Link href="/dashboard" className="border-2 border-black dark:border-white text-center px-3 py-1 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all">{name}</Link>
              <button onClick={onLogout} className="border-2 text-center px-3 py-1 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">Logout</button>
            </div>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
