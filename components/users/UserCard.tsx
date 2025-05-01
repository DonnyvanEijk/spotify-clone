import Link from "next/link";
import { Button } from "../button";

import { getImage } from "@/lib/getImage";

type Props = {
    id: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    currentUser?: string | null;
    isFollowed?: boolean;
};

export const UserCard = async ({ id, username, bio, avatar_url, currentUser, isFollowed }: Props) => {
    if (!username) {
        return null; 
    }

    const isHighlighted = currentUser === id;
    const avatarPath = await getImage(avatar_url || ""); 
    

    return (
        <div
            key={id}
            className={`p-4 rounded-lg shadow-md transition duration-300 cursor-pointer ${
                isHighlighted ? "bg-purple-700" : "bg-gray-900"
            }`}
        >
            {avatarPath && (
                <img src={avatarPath} alt="User Avatar" className="rounded-full w-16 h-16 mb-4" />
            )}
            <h2 className="text-xl font-semibold flex items-center gap-2">
                {username} {isHighlighted && "- This is you!"}{isFollowed && ( <span className="text-sm font-light">Following</span>)}
            </h2>
            <p className="text-gray-400">{bio || "No bio has been set"}</p>
            <Link href={`/users/${id}`}>
                <Button className="mt-4 text-white">See more!</Button>
            </Link>
        </div>
    );
};