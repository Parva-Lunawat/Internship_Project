"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, FileText, Users, Plus } from "lucide-react";
import { useAppSelector } from "../../Redux/customStoreWrapper";
import { selectAuthUser } from "../../Redux/selector-functions/authSelector";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "My Blogs", href: "/dashboard/blogs", icon: FileText },
  { name: "Users", href: "/dashboard/users", icon: Users, adminOnly: true },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const user = useAppSelector(selectAuthUser);
  const isAdmin = user?.role === "admin";

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 mb-8">
      <div className="flex space-x-8">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center pb-4 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <Link 
          href="/write" 
          className="mb-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-all flex items-center shadow-sm"
      >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create Post
      </Link>
    </nav>
  );
}
