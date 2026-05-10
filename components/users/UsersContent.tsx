import { Followers, UserDetails } from "@/types";
import getUser from "@/actions/getUser";
import { getImage } from "@/lib/getImage";
import { UsersGrid } from "./UsersGrid";

type Props = {
  users: UserDetails[];
  following: Followers[];
};

export const UsersContent = async ({ users, following }: Props) => {
  const currentUser = await getUser();

  const resolved = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: await getImage(user.avatar_url || ""),
      isFollowed: following.some((f) => f.followed_id === user.id),
      isCurrentUser: currentUser?.id === user.id,
    }))
  );

  return <UsersGrid users={resolved} />;
};
