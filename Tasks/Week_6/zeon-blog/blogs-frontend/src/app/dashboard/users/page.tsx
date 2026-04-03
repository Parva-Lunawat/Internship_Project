"use client";

import { useEffect, useState } from "react";
import { User, getAllUsers, deleteUser, UsersResponse } from "@/src/lib/api/usersApi";
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
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-100">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <button className="px-6 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 text-sm">
            Add New User
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full divide-y divide-gray-100 text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Identitiy</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Permission</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-black opacity-20" />
                  </td>
              </tr>
            ) : usersData?.data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 overflow-hidden border">
                      {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : user.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email || "No email"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
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
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="h-4 w-4 text-gray-400 hover:text-black" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
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
          <p className="text-sm text-gray-500 font-medium">
              Page <span className="text-black font-bold">{usersData?.meta.currentPage || 1}</span> of {usersData?.meta.totalPages || 1}
          </p>
          <div className="flex gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                className="p-2 rounded-xl border hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                disabled={page === 1}
              >
                  <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setPage(Math.min(usersData?.meta.totalPages || 1, page + 1))}
                className="p-2 rounded-xl border hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                disabled={page === (usersData?.meta.totalPages || 1)}
              >
                  <ChevronRight className="h-5 w-5" />
              </button>
          </div>
      </div>
    </div>
  );
}
