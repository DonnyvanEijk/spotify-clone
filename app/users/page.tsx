

import getCurrentlyFollowing from "@/actions/getCurrentlyFollowing";
import getUser from "@/actions/getUser";
import { getUserById, getUsersIndex } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { UsersContent } from "@/components/users/UsersContent";
import { getImage } from "@/lib/getImage";

const UsersPage = async () => {
    const userData = await getUsersIndex();
    const users = Array.isArray(userData) ? userData : [];
    const user = await getUser();
    const currentUser = await getUserById(user?.id as string);
    const avatarImage  = await getImage(currentUser?.avatar_url || "")
    const currentlyFollowing = await getCurrentlyFollowing(user?.id as string);

    return ( 
        <div className="text-white">
            <Header image={avatarImage || ""} >
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-gray-400">Every user on the platform!</p>
            </Header>
            <UsersContent users={users} following={currentlyFollowing} />
        </div>
    );
}

 
export default UsersPage;