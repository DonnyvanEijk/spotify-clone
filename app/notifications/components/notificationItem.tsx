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
          
            const { error } =  await supabase
                .from("notifications")
                .update({
                    deleted_at: new Date(),
                })
                .eq("id", notification.id);
            if (error) {
                throw new Error(error.message);
            }
            toast.success("Notification deleted successfully!");
            router.refresh();
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="notification-item p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex flex-row">
                <h2 className="text-white font-medium">
                    {notification.message.includes("follow") && (
                        <img
                            src={sentAvatar || ""}
                            alt={`${sentUser?.username}'s avatar`}
                            className="inline-block w-[10rem] h-[10rem] object-cover rounded-full mr-5"
                        />
                    )}
                    {notification.message.includes("like") && song && songImage && (
                        <img
                            src={songImage}
                            alt={`${song.title} cover`}
                            className="w-[10vw] object-cover rounded mr-4"
                        />
                    )}
                    {notification.message.includes("uploaded") && song && songImage && (
                        <img
                            src={songImage}
                            alt={`${song.title} cover`}
                            className="w-[10vw] object-cover rounded mr-4"
                        />
                    )}
                </h2>
                <div className="flex justify-center gap-2 flex-col mt-2">
                    <p className="text-2xl font-bold">
                        {notification.message}{" "}
                        {(notification.message.includes("like") || notification.message.includes("follow")) &&
                            ` ${sentUser?.username}`}
                    </p>
                    <p className="text-gray-400">
                        {notification.message.includes("like") && song && (
                            <>
                                On your song: {song.title} by{" "}
                                <span className="text-purple-500">{song.author}</span>
                            </>
                        )}
                    </p>
                    <div className="text-gray-400">
                        {notification.message.includes("uploaded") && song && (
                            <Link href={`/users/${sentUser?.id}`}>
                                <span className="text-gray-400 underline cursor-pointer hover:text-gray-300">
                                    Check out {sentUser?.username}
                                </span>
                            </Link>
                        )}
                        {notification.message.includes("like") && song && (
                            <Link href={`/users/${sentUser?.id}`}>
                                <span className="text-gray-400 underline cursor-pointer hover:text-gray-300">
                                    Check out {sentUser?.username}
                                </span>
                            </Link>
                        )}
                        {notification.message.includes("follow") && (
                            <Link href={`/users/${sentUser?.id}`}>
                                <span className="text-gray-400 underline cursor-pointer hover:text-gray-300">
                                    Check out {sentUser?.username}
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-gray-500 hover:text-gray-700 font-bold text-xl ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
                {isDeleting ? "Deleting..." : "X"}
            </button>
        </div>
    );
};

export default NotificationItem;