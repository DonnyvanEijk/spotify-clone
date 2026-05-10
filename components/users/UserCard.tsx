import Link from "next/link";
import { getImage } from "@/lib/getImage";
import { HiOutlineUser } from "react-icons/hi";

type Props = {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  isFollowed?: boolean;
  isCurrentUser?: boolean;
};

export const UserCard = async ({ id, username, bio, avatar_url, isFollowed, isCurrentUser }: Props) => {
  if (!username) return null;

  const avatarPath = await getImage(avatar_url || "");

  return (
    <Link href={`/users/${id}`}>
      <div className="group flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
        <div className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden bg-white/10">
          {avatarPath ? (
            <img src={avatarPath} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiOutlineUser size={18} className="text-neutral-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate group-hover:text-white transition-colors">
              {username}
            </p>
            {isCurrentUser && (
              <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">You</span>
            )}
            {isFollowed && !isCurrentUser && (
              <span className="text-xs text-neutral-400 bg-white/10 rounded-full px-2 py-0.5 shrink-0">Following</span>
            )}
          </div>
          <p className="text-xs text-neutral-500 truncate">{bio || "No bio"}</p>
        </div>
      </div>
    </Link>
  );
};
