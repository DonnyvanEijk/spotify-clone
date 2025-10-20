"use client";

import { AiFillPlusCircle } from "react-icons/ai";
import { Button } from "../button";
import { useEffect, useState, useTransition } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  followingId: string;
  isInitiallyFollowing: boolean;
};

export const FollowControls = ({
  userId,
  followingId,
  isInitiallyFollowing,
}: Props) => {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isPending, startTransition] = useTransition();
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const toggleFollow = () => {
    startTransition(async (): Promise<void> => { // <- ensure returns void
      if (!isFollowing) {
        const { error } = await supabase
          .from("followers")
          .insert({ follower_id: userId, followed_id: followingId });

        if (error) {
          void toast.error(error.message); // <- void to ignore return type
          return;
        }

        void toast.success("Followed user successfully!");
        setIsFollowing(true);
      } else {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", userId)
          .eq("followed_id", followingId);

        if (error) {
          void toast.error(error.message);
          return;
        }

        void toast.success("Unfollowed user successfully!");
        setIsFollowing(false);
      }

      router.refresh();
    });
  };

  return (
    <Button
      onClick={toggleFollow}
      disabled={isPending}
      className="flex items-center justify-between gap-2 bg-purple-500 hover:bg-purple-600 text-white w-[200px] rounded-2xl p-3 transition-all"
    >
      {isPending ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
      <AiFillPlusCircle className={isFollowing ? "rotate-45" : ""} />
    </Button>
  );
};
