"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../../Redux/customStoreWrapper";
import { selectAuthUser, selectAuthHydrated } from "../../Redux/selector-functions/authSelector";
import { sessionUser } from "@/src/lib/session";
import { authLogout } from "../../Redux/actions/authActions";
import { clearSession } from "@/src/lib/session";


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
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <span className="px-4 text-3xl font-semibold">Zeon Blogs</span>

        <nav className="font-semibold text-lg flex px-4 gap-6">
          <Link href="/">Home</Link>
          <Link href="/blogs">Blog</Link>
          {!hydrated ? null : !user ? (
            <div className="flex gap-6">
              <Link href="/signup" className="border-2 text-center px-2 rounded-lg bg-white">Signup</Link>
              <Link href="/login" className="border-2 border-black text-center px-2 rounded-lg bg-black text-white">Log In</Link>
            </div>
          ) : (
            <div className="flex gap-6">
              <Link href="/write" className="border-2 text-center px-2 rounded-lg bg-white">Write a Blog</Link>
              <Link href="/profile" className="border-2 border-black text-center px-2 rounded-lg bg-black text-white">{name}</Link>
              <button onClick={onLogout} className="border-2 text-center px-2 rounded-lg bg-white">Logout</button>

            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
