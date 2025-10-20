import getLikedSongs from "@/actions/getLikedSongs";
import { Header } from "@/components/header";
import Image from "next/image";
import LikedContent from "./components/liked_content";
import getUser from "@/actions/getUser";
import ShuffleControl from "./components/Controls";
import { getUserById } from "@/actions/getUsers";
import { getImage } from "@/lib/getImage";

export const revalidate = 0;

const LikedPage = async () => {
  const songs = await getLikedSongs();
  const user = await getUser();
  const currentUser = await getUserById(user?.id as string);
  const avatarImage = await getImage(currentUser?.avatar_url || "");

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      {/* Header with Liked Songs Info */}
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            {/* Liked Songs Cover */}
            <div className="relative h-32 w-32 md:h-44 md:w-44 lg:h-52 lg:w-52 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20">
              <Image
                fill
                src="/images/liked.png"
                alt="Liked Songs"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Liked Songs Details */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-purple-400 font-semibold text-sm">Playlist</span>
              <h1 className="text-white pb-2 font-bold text-4xl sm:text-5xl lg:text-6xl truncate">
                Liked Songs
              </h1>
              <p className="text-neutral-400 font-medium text-sm">
                By {currentUser?.username || "Unknown User"}
              </p>
              <p className="text-neutral-400 mt-2 font-semibold">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>
        </div>
      </Header>

      {/* Shuffle Control */}
      <div className="px-6 md:px-12 mt-6">
        <ShuffleControl songs={songs} />
      </div>

      {/* Liked Songs Content */}
      <div className="px-6 md:px-12 mt-6">
        <LikedContent songs={songs} userId={user?.id} />
      </div>

      <div className="mb-[10vh]" />
    </div>
  );
};

export default LikedPage;
