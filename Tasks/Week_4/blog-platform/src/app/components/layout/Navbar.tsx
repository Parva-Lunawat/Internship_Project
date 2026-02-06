import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <span className="px-4 text-3xl font-semibold">Zeon Blogs</span>

        <nav className="font-semibold text-lg flex px-4 gap-6">
          <Link href="/">Home</Link>
          <Link href="/blogs">Blog</Link>
          <Link href="#">Resources</Link>
          <Link href="#">Company</Link>
        </nav>
      </div>
    </header>
  );
}
