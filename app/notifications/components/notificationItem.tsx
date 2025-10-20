"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import { Notification, Song, UserDetails } from "@/types";
import { useRouter } from "next/navigation";

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ deleted_at: new Date() })
        .eq("id", notification.id);

      if (error) throw new Error(error.message);
      toast.success("Notification deleted successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to delete notification.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-[20px] bg-white/5 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-center gap-4">
        {sentAvatar && notification.message.includes("follow") && (
          <img
            src={sentAvatar}
            alt={sentUser.username || "avatar"}
            className="w-14 h-14 rounded-full object-cover shadow-lg shadow-purple-500/30"
          />
        )}

        {song && (notification.message.includes("like") || notification.message.includes("uploaded")) && songImage && (
          <img
            src={songImage}
            alt={song.title}
            className="w-14 h-14 rounded-xl object-cover shadow-lg shadow-purple-500/30"
          />
        )}

        <div className="flex flex-col gap-1">
          <p className="text-white font-semibold">
            {notification.message}{" "}
            {(notification.message.includes("like") || notification.message.includes("follow")) &&
              sentUser.username}
          </p>

          {notification.message.includes("like") && song && (
            <p className="text-gray-400 text-sm">
              On your song: {song.title} by <span className="text-purple-400">{song.author}</span>
            </p>
          )}

          {(notification.message.includes("follow") || notification.message.includes("like") || notification.message.includes("uploaded")) && (
            <Link href={`/users/${sentUser.id}`}>
              <span className="text-gray-400 underline hover:text-gray-200 text-sm cursor-pointer">
                Check out {sentUser.username}
              </span>
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`text-gray-400 hover:text-gray-200 font-bold text-xl ${
          isDeleting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isDeleting ? "Deleting..." : "✕"}
      </button>
    </div>
  );
};

export default NotificationItem;
