"use client";

import { useAppSelector } from "../../Redux/customStoreWrapper";
import { selectAuthUser } from "../../Redux/selector-functions/authSelector";
import ProfileForm from "../../components/profile/ProfileForm";
import { User } from "@/src/lib/api/usersApi";

export default function PersonalProfilePage() {
  const user = useAppSelector(selectAuthUser);

  if (!user) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-700">
        Failed to load profile. Please try logging in again.
      </div>
    );
  }

  const userToEdit: User = {
    id: "",
    ...user,
  };

  return (
    <div className="space-y-12">
      <header className="pb-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account information and how you appear to others.</p>
      </header>
      <ProfileForm initialUser={userToEdit} onUpdate={() => {}} />
    </div>
  );
}
