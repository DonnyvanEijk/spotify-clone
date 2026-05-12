import { redirect } from "next/navigation";
import getUser from "@/actions/getUser";
import getSongsWithoutLyrics from "@/actions/getSongsWithoutLyrics";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";
import { getUserById } from "@/actions/getUsers";
import LyriclessRow from "./components/LyriclessRow";
import { TbMicrophone } from "react-icons/tb";

export const revalidate = 0;

const MissingLyricsPage = async () => {
  const user = await getUser();
  if (!user) redirect("/");

  const [songs, currentUserData] = await Promise.all([
    getSongsWithoutLyrics(user.id),
    getUserById(user.id),
  ]);
  const avatarImage = await getImage(currentUserData?.avatar_url || "");

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-1">
            Lyrics
          </p>
          <h1 className="text-white font-bold text-4xl">Missing Lyrics</h1>
          <p className="text-neutral-400 text-sm mt-2">
            {songs.length === 0
              ? "All your songs have lyrics."
              : `${songs.length} ${songs.length === 1 ? "song" : "songs"} without lyrics`}
          </p>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-8 pb-24">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/15 flex items-center justify-center">
              <TbMicrophone size={28} className="text-purple-400" />
            </div>
            <p className="text-white font-semibold text-lg">All caught up!</p>
            <p className="text-neutral-400 text-sm">Every song you've uploaded has lyrics.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {songs.map((song) => (
              <LyriclessRow key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingLyricsPage;
