"use client";

import { resolveImageUrl } from "@/src/lib/utils/urlUtils";

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
};

export function UserAvatar({ src, name, className = "h-10 w-10" }: UserAvatarProps) {
  return (
    <img
      src={resolveImageUrl(src)}
      alt={name ? `${name} avatar` : ""}
      className={`${className} rounded-full object-cover`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
