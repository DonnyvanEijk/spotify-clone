"use client"
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

export const FollowControls = ({ userId, followingId, isInitiallyFollowing }: Props) => {
    const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);

    useEffect(() => {
        setIsFollowing(isInitiallyFollowing);
    }, [isInitiallyFollowing]);
    const [isPending, startTransition] = useTransition();
    const supabase = createClientComponentClient();
    const router = useRouter();

    const toggleFollow = () => {
        startTransition(async () => {
            if (!isFollowing) {
                const { error } = await supabase
                    .from("followers")
                    .insert({ follower_id: userId, followed_id: followingId });

                if (error) {
                    console.error("Error following user:", error);
                    return;
                }
                toast.success("Followed user successfully!");
                setIsFollowing(true);
                router.refresh();
            } else {
                const { error } = await supabase
                    .from("followers")
                    .delete()
                    .eq("follower_id", userId)
                    .eq("followed_id", followingId);

                if (error) {
                    console.error("Error unfollowing user:", error);
                    return;
                }
                toast.success("Unfollowed user successfully!");
                setIsFollowing(false);
                router.refresh();
            }
        });
    };

    return (
        <div className="flex-row justify-center items-center">
            <Button
                className="text-white p-5 w-[10vw] flex flex-row items-center justify-center gap-2"
                onClick={toggleFollow}
                disabled={isPending}
            >
                {isPending ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}{" "}
                {isFollowing ? <AiFillPlusCircle className="rotate-45" /> : <AiFillPlusCircle />}
            </Button>
        </div>
    );
};
