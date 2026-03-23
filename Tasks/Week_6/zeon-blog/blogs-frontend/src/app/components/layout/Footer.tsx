import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="flex flex-col mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-10 rounded-xl border text-lg bg-gray-50">
              <h1 className="absolute left-3.5 top-1">Z</h1>
            </div>
            <span className="text-lg font-semibold">Zeon Blog</span>
          </div>

          <p className="text-lg text-gray-600">
            Design amazing digital experiences that create more happy in the world.
          </p>

          <div className="flex items-center gap-3 text-lg text-gray-600 font-bold">
            <Link href="#" className="hover:text-gray-900">X</Link>
            <Link href="#" className="hover:text-gray-900">in</Link>
            <Link href="#" className="hover:text-gray-900">Insta</Link>
            <Link href="#" className="hover:text-gray-900">FB</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Zeon Blog. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-gray-900">Terms</Link>
            <Link href="#" className="hover:text-gray-900">Privacy</Link>
            <Link href="#" className="hover:text-gray-900">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
