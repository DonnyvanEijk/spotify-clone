import { getCurrentlyFollowing } from "@/actions/getCurrentlyFollowing";
import getUser from "@/actions/getUser";
import { getUserById, getUsersIndex } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { UsersContent } from "@/components/users/UsersContent";
import { getImage } from "@/lib/getImage";

const UsersPage = async () => {
    const userData = await getUsersIndex();
    const users = (Array.isArray(userData) ? userData : []).filter(u => !!u.username);
    const user = await getUser();
    const currentUser = user?.id ? await getUserById(user.id) : null;
    const avatarImage = await getImage(currentUser?.avatar_url || "");
    const currentlyFollowing = user?.id ? await getCurrentlyFollowing(user.id) : [];

    return (
        <div className="h-full w-full overflow-hidden overflow-y-auto">
            <Header image={avatarImage || ""}>
                <div className="mt-20 px-6 md:px-12">
                    <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">Community</p>
                    <h1 className="text-white text-3xl font-bold">People</h1>
                    <p className="text-neutral-400 text-sm mt-1">
                        {users.length} {users.length === 1 ? "member" : "members"}
                    </p>
                </div>
            </Header>

            <div className="px-6 md:px-12 mt-6 pb-24">
                <UsersContent users={users} following={currentlyFollowing} />
            </div>
        </div>
    );
};

export default UsersPage;
