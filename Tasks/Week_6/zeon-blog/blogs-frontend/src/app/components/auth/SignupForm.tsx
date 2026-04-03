"use client"
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { setSession } from "@/src/lib/session";
import { SignupInput, signup } from "@/src/lib/authClient";
import { useDispatch} from "react-redux";
import { authLoginSuccess } from "../../Redux/actions/authActions";
import { toast } from "react-toastify";
export default function SignupForm() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
        confirmPass: "",
    });

    const email = form.email.trim().toLowerCase();
    const canSubmit = useMemo(() => {
        return (form.name.trim() && email && form.password && form.confirmPass);
    }, [form, email]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await signup(form);
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
            <div className="space-y-1 flex gap-4 items-center">
                <label className="text-base w-23 font-medium">Name</label>
                <input value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter Your Name..."
                    className="rounded-lg h-10 w-full border px-2 focus:border-black"
                    required />
            </div>
            <div className="space-y-1 flex gap-4 items-center">
                <label className="text-base w-23 font-medium">Email</label>
                <input value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="example@gmail.com"
                    className="rounded-lg h-10 w-full border px-2 focus:border-black"
                    required />
            </div>
            <div className="space-y-1 flex gap-4 items-center">
                <label className="text-base w-23 font-medium">Password</label>
                <input value={form.password} type="password"
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Set Password"
                    className="rounded-lg h-10 w-full border px-2 focus:border-black"
                    required />
            </div>
            <div className="space-y-1 flex gap-4 items-center">
                <label className="text-base w-23 font-medium">Confirm</label>
                <input value={form.confirmPass} type="password"
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPass: e.target.value }))}
                    placeholder="Confirm Password"
                    className="rounded-lg h-10 w-full border px-2 focus:border-black"
                    required />
            </div>

            <button type="submit"
                disabled={!canSubmit || isPending}
                className={`h-11 w-full rounded-lg px-4 text-sm font-medium text-white transition ${!canSubmit || isPending
                    ? "bg-gray-300"
                    : "bg-gray-900 hover:bg-black"
                    }`}
            >
                {isPending ? "Creating..." : "Create account"}
            </button>
        </form >
    );
}