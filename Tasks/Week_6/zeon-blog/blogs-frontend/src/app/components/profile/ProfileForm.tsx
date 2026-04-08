"use client";

import { useState } from "react";
import { User, UserRole, updateCurrentUser } from "@/src/lib/api/usersApi";
import { Camera, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../Redux/customStoreWrapper";
import { authUpdateUser } from "../../Redux/actions/authActions";
import { selectAuthUser } from "../../Redux/selector-functions/authSelector";
import { setSession } from "@/src/lib/session";
import ImageUploadModal from "../commons/ImageUploadModal";
import { toast } from "react-toastify";

interface ProfileFormProps {
  initialUser: User;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileForm({ initialUser, onUpdate }: ProfileFormProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectAuthUser);
  const isAdmin = currentUser?.role === "admin";
  
  const [formData, setFormData] = useState({
    name: currentUser?.name,
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    role: (currentUser?.role as UserRole) || "reader",
  });
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  type UpdatePayload = {
    name: string | undefined;
    email: string;
    avatar: string | null;
    role?: UserRole;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatePayload: UpdatePayload = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar || null,
      };

      // Only send role if user is admin to avoid ForbiddenException on backend
      if (isAdmin) {
          updatePayload.role = formData.role;
      }

      const updated = await updateCurrentUser(updatePayload);

      const sessionUpdate = {
        name: updated.name,
        email: updated.email!,
        avatar: updated.avatar,
        role: updated.role as "admin" | "writer" | "reader",
        isProfileComplete: updated.isProfileComplete!,
        createdAt: initialUser.createdAt!, // Keep existing
      };

      setSession(sessionUpdate);
      dispatch(authUpdateUser(sessionUpdate));
      
      onUpdate(updated);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="flex flex-col gap-8 border-b border-gray-100 pb-8 sm:flex-row sm:items-center dark:border-gray-800">
        <div className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 transition-colors hover:border-black dark:border-gray-700 dark:bg-slate-900 dark:hover:border-sky-400">
          {formData.avatar ? (
            <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            // <UserIcon className="h-12 w-12 text-gray-300" />
            <img src={currentUser?.avatar || "/default-avatar.png"} alt="Avatar" className="h-12 w-12 object-cover" />
          )}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Account Picture</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Update your public avatar and identification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-bold text-gray-700 dark:text-gray-300">Role</label>
          <select
            id="role" disabled={true}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
          >
            <option value="reader">Reader</option>
            <option value="writer">Writer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex flex-col space-y-4">

        
        <div className="flex justify-end gap-4">
            <button
                type="button"
                className="px-6 py-3 font-bold text-gray-500 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-sky-200"
                onClick={() => setFormData({ 
                   name: initialUser.name, 
                   email: initialUser.email || "",
                   avatar: initialUser.avatar || "", 
                   role: (initialUser.role as UserRole) || "reader" 
                })}
            >
                Reset
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex items-center rounded-xl bg-gray-900 px-8 py-3 font-bold text-white transition-all active:scale-95 hover:bg-black disabled:opacity-50 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
            </button>
        </div>
      </div>
      </form>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(url) => setFormData({ ...formData, avatar: url })}
      />
    </>
  );
}
