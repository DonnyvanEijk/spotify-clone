import { Followers, UserDetails } from "@/types";
import { UserCard } from "./UserCard";
import getUser from "@/actions/getUser";

type Props = {
  users: UserDetails[];
  following: Followers[];
};

export const UsersContent = async ({ users, following }: Props) => {
  const currentUser = await getUser();

  if (users.length === 0) {
    return (
      <div className="w-full text-neutral-400 px-6">
        No users found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => {
        const isFollowed = following.some((f) => f.followed_id === user.id);

        return (
          <div
            key={user.id}
            className="
              relative
              rounded-2xl
              overflow-hidden
         
              backdrop-blur-xl
      
              p-4
              transition-all
              duration-300
              hover:bg-white/10
              hover:border-white/20
              hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]
            "
          >
            <UserCard
              id={user.id}
              username={user.username}
              bio={user.bio}
              avatar_url={user.avatar_url}
              currentUser={currentUser?.id || null}
              isFollowed={isFollowed}
            />
          </div>
        );
      })}
    </div>
  );
};
