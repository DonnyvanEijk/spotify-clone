
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

export const UserCard = async ({
  id,
  username,
  bio,
  avatar_url,
  currentUser,
  isFollowed,
}: Props) => {
  if (!username) return null;

  const isHighlighted = currentUser === id;
  const avatarPath = await getImage(avatar_url || "");

  return (
    <Link href={`/users/${id}`} className="w-full">
      <div
        className={`
          relative flex flex-col items-start gap-3 p-5 rounded-2xl
          bg-white/5 backdrop-blur-xl border border-white/10
          transition-all duration-300 cursor-pointer
          hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]
          ${isHighlighted ? "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)]" : ""}
        `}
      >
        {/* Avatar */}
        {avatarPath && avatarPath.trim() && (
          <img
            src={avatarPath}
            alt={`${username}'s avatar`}
            className="rounded-full w-20 h-20 object-cover"
          />
        )}

        {/* User Info */}
        <div className="flex flex-col w-full gap-1">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
              {username}
            </h2>
            {isFollowed && (
              <span className="text-sm text-purple-400 font-medium">Following</span>
            )}
          </div>
          {isHighlighted && (
            <span className="text-sm text-purple-400 font-medium">
              This is you!
            </span>
          )}
          <p className="text-neutral-400 text-sm line-clamp-3">
            {bio || "No bio has been set"}
          </p>
        </div>

        {/* See More Button */}
        <Button className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white">
          See more!
        </Button>
      </div>
    </Link>
  );
};
