import { Header } from "@/components/header";
import { BillingContent } from "./components/billing-content";
import { InfoContent } from "./components/info-content";
import LikeOverview from "./components/like-overview";

import getUser from "@/actions/getUser";
import getSongsWithLikeCounts from "@/actions/getMostLiked";
import { UserContent } from "./components/user-content";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";
import { getFollowedUsers } from "@/actions/getCurrentlyFollowing";
import FollowerContent from "./components/follower-content";
import getFollowingYou from "@/actions/getFollowingYou";

const AccountPage = async () => {
    const user = await getUser();
    if (!user) return null;

    const songLikes = user?.id ? await getSongsWithLikeCounts(user.id) : [];
    const currentUser = user?.id ? await getUserById(user.id) : null;
    const avatarImage = await getImage(currentUser?.avatar_url || "");
    const followingUsers = user?.id ? await getFollowedUsers(user.id) : [];
    const followingYou = await getFollowingYou();

    if (!currentUser) return null;

    return (
        <div className="h-full w-full overflow-hidden overflow-y-auto">
            <Header image={avatarImage || ""}>
                <div className="mt-20 px-6 md:px-12">
                    <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">Your Account</p>
                    <h1 className="text-white text-3xl font-bold">{currentUser.username || "Profile"}</h1>
                </div>
            </Header>

            <div className="px-6 md:px-12 pb-24 flex flex-col gap-6 mt-6">
                {/* Profile */}
                <UserContent
                    id={user.id}
                    bio={currentUser?.bio ?? null}
                    avatar_url={currentUser?.avatar_url ?? null}
                    username={currentUser?.username ?? null}
                    presence={currentUser?.presence ?? "offline"}
                />

                {/* Followers */}
                <FollowerContent followingYou={followingYou} followingUsers={followingUsers} />

                {/* Billing + Info */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <BillingContent />
                    <InfoContent />
                </div>

                {/* Song Likes */}
                {user?.id && songLikes.length > 0 && (
                    <LikeOverview userId={user.id} songs={songLikes} />
                )}
            </div>
        </div>
    );
};

export default AccountPage;
