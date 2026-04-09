import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900 transition-colors duration-300 dark:border-gray-800 dark:bg-slate-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-7xl flex-col px-6 py-12">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 text-lg dark:border-slate-700 dark:bg-slate-900">
              <h1 className="absolute left-3.5 top-1">Z</h1>
            </div>
            <span className="text-lg font-semibold">Zeon Blog</span>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Design amazing digital experiences that create more happy in the world.
          </p>

          <div className="flex items-center gap-3 text-lg font-bold text-gray-600 dark:text-gray-300">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">X</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">in</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">Insta</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">FB</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Copyright {new Date().getFullYear()} Zeon Blog. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">Terms</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">Privacy</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-sky-200">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

