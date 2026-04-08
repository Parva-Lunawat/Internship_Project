import SignupForm from "../components/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign up to start reading and publishing.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <SignupForm />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link className="font-medium text-gray-900 underline dark:text-gray-100" href="/login">
            Log in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
