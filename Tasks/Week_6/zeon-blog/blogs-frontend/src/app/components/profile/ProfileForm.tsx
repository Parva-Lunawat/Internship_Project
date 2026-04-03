"use client";

import { useState } from "react";
import { User, UserRole, updateCurrentUser } from "@/src/lib/api/usersApi";
import { Camera, Save, Loader2, User as UserIcon } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatePayload: any = {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-8 pb-8 border-b border-gray-100">
        <div className="relative h-32 w-32 rounded-2xl bg-gray-50 border overflow-hidden flex items-center justify-center group transition-colors hover:border-black">
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
          <p className="text-gray-500 text-sm">Update your public avatar and identification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-gray-700">Display Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-bold text-gray-700">Role</label>
          <select
            id="role" disabled={true}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
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
                className="px-6 py-3 font-bold text-gray-500 hover:text-black transition-colors"
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
                className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 flex items-center"
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
