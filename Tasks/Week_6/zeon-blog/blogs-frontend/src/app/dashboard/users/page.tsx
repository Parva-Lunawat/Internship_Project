"use client";

import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, UsersResponse } from "@/src/lib/api/usersApi";
import { Search, Trash2, Edit2, Loader2, Mail, Shield, ChevronLeft, ChevronRight } from "lucide-react";

export default function UsersManagementPage() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getAllUsers({ page, pageSize: 10, query: search });
      setUsersData(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <button className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-bold text-white transition-all active:scale-95 hover:bg-black dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
            Add New User
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-gray-100 text-left dark:divide-gray-800">
          <thead className="bg-gray-50/50 dark:bg-slate-900/70">
            <tr>
              <th className="px-6 py-4 text-[10px] text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Identitiy</th>
              <th className="px-6 py-4 text-[10px] text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Permission</th>
              <th className="px-6 py-4 text-[10px] text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-black opacity-20 dark:text-white" />
                  </td>
              </tr>
            ) : usersData?.data.map((user) => (
              <tr key={user.id} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border bg-gray-100 font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : user.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.name}</div>
                      <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email || "No email"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-black dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      user.isProfileComplete ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                  }`}>
                    {user.isProfileComplete ? "Complete" : "Incomplete"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800">
                          <Edit2 className="h-4 w-4 text-gray-400 hover:text-black dark:hover:text-sky-200" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Page <span className="font-bold text-black dark:text-gray-100">{usersData?.meta.currentPage || 1}</span> of {usersData?.meta.totalPages || 1}
          </p>
          <div className="flex gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                className="rounded-xl border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-slate-800"
                disabled={page === 1}
              >
                  <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setPage(Math.min(usersData?.meta.totalPages || 1, page + 1))}
                className="rounded-xl border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent dark:border-gray-700 dark:hover:bg-slate-800"
                disabled={page === (usersData?.meta.totalPages || 1)}
              >
                  <ChevronRight className="h-5 w-5" />
              </button>
          </div>
      </div>
    </div>
  );
}
