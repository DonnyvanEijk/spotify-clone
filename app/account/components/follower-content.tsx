import { getImage } from "@/lib/getImage";
import { UserDetails } from "@/types";
import Link from "next/link";

type Props = {
    followingUsers: UserDetails[];
    followingYou: UserDetails[];
};
const FollowerContent = async ({ followingUsers, followingYou }: Props) => {
    return (
        <div className="lg:grid flex grid-cols-2 flex-col my-5">
            <div className="m-6 mb-2">
                <h1 className="text-2xl font-bold text-white">Currently following</h1>
                <div className="overflow-y-auto w-fit rounded flex flex-col pr-5 max-h-64">
                    {followingUsers.length > 0 ? (
                        followingUsers.map(async (user) => {
                            const imageUrl = await getImage(user.avatar_url || "");
                            return (
                                <Link
                                    href={`/users/${user.id}`}
                                    className="flex items-center w-fit cursor-pointer space-x-4 my-5"
                                    key={user.id}
                                >
                                    {imageUrl && (
                                        <img
                                            src={imageUrl}
                                            alt={`${user.username}'s avatar`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <h2 className="text-white">{user.username}</h2>
                                </Link>
                            );
                        })
                    ) : (
                        <div>
                            <p className="text-white">No one is being followed</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="m-6 mb-2">
                <h1 className="text-2xl font-bold text-white">Following you</h1>
                <div className="overflow-y-auto w-fit rounded flex flex-col pr-5 max-h-64">
                    {followingYou.length > 0 ? (
                        followingYou.map(async (user) => {
                            const imageUrl = await getImage(user.avatar_url || "");
                            return (
                                <Link
                                    href={`/users/${user.id}`}
                                    className="flex items-center w-fit cursor-pointer space-x-4 my-5"
                                    key={user.id}
                                >
                                    {imageUrl && (
                                        <img
                                            src={imageUrl}
                                            alt={`${user.username}'s avatar`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    )}
                                    <h2 className="text-white">{user.username}</h2>
                                </Link>
                            );
                        })
                    ) : (
                        <div>
                            <p className="text-white">No one is following you...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowerContent;
