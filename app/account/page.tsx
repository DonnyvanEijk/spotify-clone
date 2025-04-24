import { Header } from "@/components/header";
import { BillingContent } from "./components/billing-content";
import { InfoContent } from "./components/info-content";
import LikeOverview from "./components/like-overview";

import getUser from "@/actions/getUser";
import getSongsWithLikeCounts from "@/actions/getMostLiked";
import { UserContent } from "./components/user-content";
import { getUserById } from "@/actions/getUsers";

const AccountPage = async () => {
    const songLikes = await getSongsWithLikeCounts();
    const user = await getUser();
    const currentUser = await getUserById(user?.id as string);

    if (!currentUser) {
        return new Error("User not found");
    }

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <Header className="from-bg-neutral-900">
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">Account Settings</h1>
                </div>
            </Header>
            <UserContent
                id={user!.id}
                bio={currentUser?.bio!}
                avatar_url={currentUser?.avatar_url!}
                username={currentUser?.username!}
            />
            <BillingContent />
            <InfoContent />
            {user?.id && <LikeOverview userId={user.id} songs={songLikes} />}
        </div>
    );
};

export default AccountPage;