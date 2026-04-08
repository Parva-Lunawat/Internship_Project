"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "../Redux/customStoreWrapper";
import { selectAuthUser } from "../Redux/selector-functions/authSelector";
import { ApiRequestError, getMyBlogs } from "@/src/lib/api/blogsApi";
import { FileText, User as UserIcon, LayoutDashboard, Clock, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const user = useAppSelector(selectAuthUser);
  const [blogCount, setBlogCount] = useState<number | null>(null);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const [loadingStats, setLoadingStats] = useState(true);

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const data = await getMyBlogs({ page: 1, pageSize: 1 });
        setBlogCount(data.meta.totalBlogs);
      } catch (err: unknown) {
        if (!(err instanceof ApiRequestError && err.status === 401)) {
          console.error("Failed to fetch blog stats:", err);
        }
        setBlogCount(0);
      } finally {
        setLoadingStats(false);
      }
    }

    if (!hydrated) {
      return;
    }

    if (!user) {
      setBlogCount(0);
      setLoadingStats(false);
      return;
    }

    fetchStats();
  }, [hydrated, user]);

  const stats = [
    { 
      name: "Total Blogs", 
      value: loadingStats ? "..." : (blogCount?.toString() || "0"), 
      icon: FileText 
    },
    { 
      name: "Profile Status", 
      value: user?.isProfileComplete ? "Complete" : "Incomplete", 
      icon: UserIcon 
    },
    { 
      name: "Role", 
      value: user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "Reader", 
      icon: LayoutDashboard 
    },
    { 
      name: "Joined On", 
      value: formatJoinedDate(user?.createdAt), 
      icon: Clock 
    },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
            <div className="flex flex-col space-y-2">
                <item.icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</h3>
                <div className="flex items-center">
                    {item.value === "..." && <Loader2 className="h-4 w-4 animate-spin mr-2 text-gray-300 dark:text-gray-600" />}
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                </div>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
           <Clock className="h-10 w-10 mb-2 opacity-20" />
           <p>Your recent activity will appear here.</p>
        </div>
      </section>
    </div>
  );
}
