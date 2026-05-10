"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import toast from "react-hot-toast";
import { Notification, Song, UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import { HiOutlineTrash } from "react-icons/hi";

interface NotificationItemProps {
  notification: Notification;
  sentUser: UserDetails;
  song: Song | null;
  sentAvatar: string | null;
  songImage: string | null;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  sentUser,
  song,
  sentAvatar,
  songImage,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = useSupabaseClient();
  const router = useRouter();

  const isFollow = notification.message.includes("follow");
  const isLike = notification.message.includes("like");
  const isUpload = notification.message.includes("uploaded");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ deleted_at: new Date() })
        .eq("id", notification.id);

      if (error) throw new Error(error.message);
      toast.success("Notification dismissed");
      router.refresh();
    } catch {
      toast.error("Failed to dismiss notification.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
      {/* Avatar or song image */}
      <div className="shrink-0">
        {isFollow && sentAvatar ? (
          <img
            src={sentAvatar}
            alt={sentUser.username || "avatar"}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (isLike || isUpload) && songImage ? (
          <img
            src={songImage}
            alt={song?.title || "song"}
            className="w-11 h-11 rounded-lg object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-white/10" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <p className="text-sm font-medium text-white truncate">
          {notification.message}{" "}
          {(isLike || isFollow) && (
            <span className="text-neutral-300">{sentUser.username}</span>
          )}
        </p>

        {isLike && song && (
          <p className="text-xs text-neutral-400 truncate">
            {song.title} · {song.author}
          </p>
        )}

        {(isFollow || isLike || isUpload) && (
          <Link href={`/users/${sentUser.id}`}>
            <span className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
              View profile →
            </span>
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="shrink-0 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <HiOutlineTrash size={16} />
      </button>
    </div>
  );
};

export default NotificationItem;
