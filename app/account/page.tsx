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
    
   
    if (!user) {
        return new Error("User not found");
    }
    const songLikes = await getSongsWithLikeCounts(user?.id as string);
    const currentUser = await getUserById(user?.id as string);
    const avatarImage  = await getImage(currentUser?.avatar_url || "")
    const followingUsers = await getFollowedUsers(user?.id as string);
    const followingYou = await getFollowingYou();

    if (!currentUser) {
        return new Error("User not found");
    }

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header image={avatarImage || ""} className="from-bg-neutral-900">
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">Account Settings</h1>
                </div>
            </Header>
            <UserContent
                id={user.id}
                bio={currentUser?.bio ?? null}
                avatar_url={currentUser?.avatar_url ?? null}
                username={currentUser?.username ?? null}
            />
            <FollowerContent followingYou={followingYou} followingUsers={followingUsers}/>
            <BillingContent />
            <InfoContent />
            {user?.id && <LikeOverview userId={user.id} songs={songLikes} />}
        </div>
    );
};

export default AccountPage;