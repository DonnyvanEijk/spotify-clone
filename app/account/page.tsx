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
    if (!user) return new Error("User not found");

    const songLikes = await getSongsWithLikeCounts(user?.id as string);
    const currentUser = await getUserById(user?.id as string);
    const avatarImage  = await getImage(currentUser?.avatar_url || "")
    const followingUsers = await getFollowedUsers(user?.id as string);
    const followingYou = await getFollowingYou();

    if (!currentUser) return new Error("User not found");

    return (
        <div className="bg-neutral-900 p-6 rounded-2xl min-h-screen flex flex-col gap-6">
            <Header image={avatarImage || ""} className="from-neutral-900/60 to-neutral-800/20 backdrop-blur-md rounded-2xl p-6">
                <h1 className="text-white text-3xl font-semibold">Account Settings</h1>
            </Header>

            {/* User Profile */}
            <UserContent
                id={user.id}
                bio={currentUser?.bio ?? null}
                avatar_url={currentUser?.avatar_url ?? null}
                username={currentUser?.username ?? null}
            />

            {/* Followers & Following */}
            <FollowerContent followingYou={followingYou} followingUsers={followingUsers} />

            {/* Billing / Info Sections */}
            <div className="grid lg:grid-cols-2 gap-6">
                <BillingContent />
                <InfoContent />
            </div>

            {/* Likes Overview */}
            {user?.id && (
                <LikeOverview userId={user.id} songs={songLikes} />
            )}
        </div>
    );
};

export default AccountPage;
