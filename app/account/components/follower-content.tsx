import { getImage } from "@/lib/getImage";
import { UserDetails } from "@/types";
import Link from "next/link";

type Props = {
    followingUsers: UserDetails[];
    followingYou: UserDetails[];
};

const UserRow = async ({ user }: { user: UserDetails }) => {
    const avatar = await getImage(user.avatar_url || "");
    return (
        <Link
            href={`/users/${user.id}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group"
        >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                {avatar && <img src={avatar} alt={user.username} className="w-full h-full object-cover" />}
            </div>
            <span className="text-sm text-neutral-300 group-hover:text-white truncate transition-colors">
                {user.username}
            </span>
        </Link>
    );
};

const FollowerContent = async ({ followingUsers, followingYou }: Props) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Following</h2>
                    <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{followingUsers.length}</span>
                </div>
                <div className="flex flex-col max-h-52 overflow-y-auto">
                    {followingUsers.length ? (
                        await Promise.all(followingUsers.map(user => <UserRow key={user.id} user={user} />))
                    ) : (
                        <p className="text-sm text-neutral-500 px-2">Not following anyone yet</p>
                    )}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Followers</h2>
                    <span className="text-xs text-neutral-500 bg-white/5 rounded-full px-2 py-0.5">{followingYou.length}</span>
                </div>
                <div className="flex flex-col max-h-52 overflow-y-auto">
                    {followingYou.length ? (
                        await Promise.all(followingYou.map(user => <UserRow key={user.id} user={user} />))
                    ) : (
                        <p className="text-sm text-neutral-500 px-2">No followers yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowerContent;
