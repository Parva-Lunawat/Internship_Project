"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login, LoginInput } from "@/src/lib/authClient";
import { setSession } from "@/src/lib/session";
import { useDispatch } from "react-redux";
import { authLoginSuccess } from "../../Redux/actions/authActions";
import { toast } from "react-toastify";

export default function LoginForm() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [input, setInput] = useState<LoginInput>({
        email: "",
        password: "",
    });
    const canSubmit = useMemo(() => {
        return input.email.trim().length > 0 && input.password.length > 8;
    }, [input.email, input.password]);

    async function onSubmit(e: React.FormEvent) { 
        e.preventDefault();
        const result = await login(input);
        if (result.type === "unauthenticated") {
            toast.error(result.error); return;
        }
        setSession(result.user);
        dispatch(authLoginSuccess(result.user));
        startTransition(() => {
            router.push("/");
        })
    }
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1">
                <label className="text-base font-medium">Email</label>
                <input
                    value={input.email}
                    onChange={(e) => setInput((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="text-base font-medium">Password</label>
                <input
                    value={input.password}
                    onChange={(e) => setInput((prev) => ({ ...prev, password: e.target.value }))}
                    type="password"
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={!canSubmit || isPending}
                className={`h-11 w-full rounded-lg px-4 text-sm font-medium text-white transition ${!canSubmit || isPending
                    ? "bg-gray-300"
                    : "bg-gray-900 hover:bg-black"
                    }`}
            >
                {isPending ? "Logging in..." : "Log in"}
            </button>
        </form>
    );
}
