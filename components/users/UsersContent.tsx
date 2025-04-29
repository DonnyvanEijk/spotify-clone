import { Followers, UserDetails } from "@/types"
import { UserCard } from "./UserCard"
import getUser from "@/actions/getUser"

type Props = {
    users: UserDetails[]
    following: Followers[]
}

export const UsersContent = async ({ users, following }: Props) => {

    const currentUser = await getUser();

    return (
        <div className="m-5 text-white">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => {
                        const isFollowed = following.some(f => f.followed_id === user.id);
                        return (
                            <UserCard
                                key={user.id}
                                id={user.id}
                                username={user.username}
                                bio={user.bio}
                                avatar_url={user.avatar_url}
                                currentUser={currentUser?.id || null}
                                isFollowed={isFollowed}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    )
}