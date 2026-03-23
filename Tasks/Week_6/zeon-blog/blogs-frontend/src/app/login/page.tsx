import Link from "next/link";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="mx-auto grid content-center text-center w-full max-w-md gap-8 max-h-fit">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-sm text-gray-600">Login to continue to Zeon Blog</p>
            </div>
            <div className="rounded-xl text-gray-600">
                <LoginForm />
                <p>
                    Don't Have an account?{" "}
                    <Link className="underline italic text-gray-500 hover:text-black"
                    href={"/signup"}>
                        Create One
                    </Link>
                </p>
            </div>
        </div>
    );
}

// export default function LoginPage() {
//   return (
//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <LoginForm />
//         <p className="mt-4 text-center text-sm text-gray-600">
//           Don’t have an account?{" "}
//           <Link className="font-medium text-gray-900 underline" href="/signup">
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
