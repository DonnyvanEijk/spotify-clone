import { getCurrentlyFollowing } from "@/actions/getCurrentlyFollowing";
import getFollowerAmount from "@/actions/getFollowerAmount";
import getSongsWithLikeCounts from "@/actions/getMostLiked";
import getPlaylistsByUser from "@/actions/getPlaylistsByUser";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { FollowControls } from "@/components/users/FollowControls";
import { PlayListList } from "@/components/users/playlists/Playlist-List";
import { SongList } from "@/components/users/songs/SongList";
import { getImage } from "@/lib/getImage";
import { HiOutlineUsers } from "react-icons/hi";

type Props = {
    params: Promise<{ id: string }>
}

const UserPage = async ({ params }: Props) => {
    const { id } = await params;
    const user = await getUserById(id);
    const userNOW = await getUser();
    const currentUser = userNOW?.id ? await getUserById(userNOW.id) : null;
    const currentFollows = userNOW?.id ? await getCurrentlyFollowing(userNOW.id) : [];
    const followerAmount = await getFollowerAmount(id);
    const avatarImage = await getImage(currentUser?.avatar_url || "");

    if (!user) return null;

    if (!user.username) {
        return (
            <div className="h-full w-full overflow-hidden overflow-y-auto">
                <Header image={avatarImage || ""}>
                    <div className="mt-20 px-6 md:px-12">
                        <h1 className="text-white text-2xl font-bold">Incomplete Profile</h1>
                        <p className="text-neutral-400 text-sm mt-1">This user hasn't set up their profile yet.</p>
                    </div>
                </Header>
            </div>
        );
    }

    const avatarPath = await getImage(user.avatar_url || "");
    const songsWithLikes = await getSongsWithLikeCounts(user.id as string);
    const playlists = await getPlaylistsByUser(user.id as string);
    const isOwnProfile = currentUser?.id === user.id;
    const isFollowing = currentFollows.some(f => f.followed_id === id);

    return (
        <div className="h-full w-full overflow-hidden overflow-y-auto">
            <Header image={avatarImage || ""}>
                <div className="mt-20 px-6 md:px-12">
                    <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">Profile</p>
                    <h1 className="text-white text-3xl font-bold">{user.username}</h1>
                </div>
            </Header>

            <div className="px-6 md:px-12 mt-6 pb-24 flex flex-col gap-6">
                {/* Profile card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden bg-white/10">
                        {avatarPath && (
                            <img src={avatarPath} alt={user.username} className="w-full h-full object-cover" />
                        )}
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className="text-lg font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-neutral-400 line-clamp-2">{user.bio || "No bio"}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                            <HiOutlineUsers size={13} />
                            <span>{followerAmount} {followerAmount === 1 ? "follower" : "followers"}</span>
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <div className="shrink-0">
                            <FollowControls
                                userId={currentUser?.id || ""}
                                followingId={id}
                                isInitiallyFollowing={isFollowing}
                            />
                        </div>
                    )}
                </div>

                {/* Songs + Playlists */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <SongList songs={songsWithLikes} />
                    <PlayListList playlists={playlists} />
                </div>
            </div>
        </div>
    );
};

export default UserPage;
