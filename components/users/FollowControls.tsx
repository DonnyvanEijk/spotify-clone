"use client";

import { Button } from "../button";
import { useEffect, useState, useTransition } from "react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  followingId: string;
  isInitiallyFollowing: boolean;
};

export const FollowControls = ({ userId, followingId, isInitiallyFollowing }: Props) => {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isPending, startTransition] = useTransition();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const toggleFollow = () => {
    startTransition(async (): Promise<void> => {
      if (!isFollowing) {
        const { error } = await (supabase as any)
          .from("followers")
          .insert({ follower_id: userId, followed_id: followingId });
        if (error) { toast.error(error.message); return; }
        toast.success("Followed!");
        setIsFollowing(true);
      } else {
        const { error } = await (supabase as any)
          .from("followers")
          .delete()
          .eq("follower_id", userId)
          .eq("followed_id", followingId);
        if (error) { toast.error(error.message); return; }
        toast.success("Unfollowed");
        setIsFollowing(false);
      }
      router.refresh();
    });
  };

  return (
    <Button
      onClick={toggleFollow}
      disabled={isPending || !userId}
      className={`w-32 text-sm transition-all ${
        isFollowing
          ? "bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300"
          : "bg-white text-black hover:bg-neutral-200"
      }`}
    >
      {isPending ? "…" : isFollowing ? "Following" : "Follow"}
    </Button>
  );
};
