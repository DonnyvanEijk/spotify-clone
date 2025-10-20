import { getImage } from "@/lib/getImage";
import { UserDetails } from "@/types";
import Link from "next/link";

type Props = {
    followingUsers: UserDetails[];
    followingYou: UserDetails[];
};

const FollowerContent = async ({ followingUsers, followingYou }: Props) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6 my-5">
            {/** Currently Following */}
            <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                <h2 className="text-xl font-bold text-white mb-4">Currently Following</h2>
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
                    {followingUsers.length ? await Promise.all(followingUsers.map(async user => {
                        const avatar = await getImage(user.avatar_url || "");
                        return (
                            <Link key={user.id} href={`/users/${user.id}`} className="flex items-center gap-3  transition">
                                {avatar && <img src={avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />}
                                <span className="text-white truncate">{user.username}</span>
                            </Link>
                        );
                    })) : <p className="text-white">Not following anyone</p>}
                </div>
            </div>

            {/** Following You */}
            <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                <h2 className="text-xl font-bold text-white mb-4">Following You</h2>
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
                    {followingYou.length ? await Promise.all(followingYou.map(async user => {
                        const avatar = await getImage(user.avatar_url || "");
                        return (
                            <Link key={user.id} href={`/users/${user.id}`} className="flex items-center gap-3 transition">
                                {avatar && <img src={avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />}
                                <span className="text-white truncate">{user.username}</span>
                            </Link>
                        );
                    })) : <p className="text-white">No followers yet</p>}
                </div>
            </div>
        </div>
    );
};

export default FollowerContent;
