import { getImage } from "@/lib/getImage";
import { UserDetails } from "@/types";
import { FollowerList } from "./FollowerList";

type Props = {
    followingUsers: UserDetails[];
    followingYou: UserDetails[];
};

const FollowerContent = async ({ followingUsers, followingYou }: Props) => {
    const [resolvedFollowing, resolvedFollowers] = await Promise.all([
        Promise.all(
            followingUsers.map(async (u) => ({
                id: u.id,
                username: u.username,
                presence: u.presence ?? "offline",
                avatarUrl: await getImage(u.avatar_url || ""),
            }))
        ),
        Promise.all(
            followingYou.map(async (u) => ({
                id: u.id,
                username: u.username,
                presence: u.presence ?? "offline",
                avatarUrl: await getImage(u.avatar_url || ""),
            }))
        ),
    ]);

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <FollowerList
                users={resolvedFollowing}
                title="Following"
                emptyMessage="Not following anyone yet"
                count={followingUsers.length}
            />
            <FollowerList
                users={resolvedFollowers}
                title="Followers"
                emptyMessage="No followers yet"
                count={followingYou.length}
            />
        </div>
    );
};

export default FollowerContent;
