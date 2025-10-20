import React from "react";
import getPlaylist from "@/actions/getPlaylist";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";
import Image from "next/image";
import getPlaylistSongs from "@/actions/getPlaylistSongs";
import PlaylistContent from "./components/PlaylistContent";
import ShuffleControl from "./components/Controls";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";

export const revalidate = 0;

type Props = {
  params: {
    playlistId: string;
  };
};

const PlaylistPage = async ({ params }: Props) => {
  const user = await getUser();
  const playlistId = params.playlistId;
  const playlist = await getPlaylist(playlistId);
  const imagePath = await getImage(playlist.image_path);
  const songs = await getPlaylistSongs(playlistId);
  const isOwner = user ? playlist.user_id === user.id : false;
  const currentUserData = await getUserById(user?.id as string);
  const avatarImage = await getImage(currentUserData?.avatar_url || "");

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      {/* Header with Playlist Info */}
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            {/* Playlist Cover */}
            <div className="relative h-32 w-32 md:h-44 md:w-44 lg:h-52 lg:w-52 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20">
              <Image
                fill
                src={imagePath || "/images/liked.png"}
                alt={playlist.name}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Playlist Details */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-purple-400 font-semibold text-sm">Playlist</span>
              <h1 className="text-white pb-2 font-bold text-4xl sm:text-5xl lg:text-6xl truncate">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-neutral-400 font-medium text-sm max-w-md line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <p className="text-neutral-400 mt-2 font-semibold">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>
        </div>
      </Header>

      {/* Shuffle Control */}
      <div className="px-6 md:px-12 mt-6">
        <ShuffleControl songs={songs} id={playlistId} isOwner={isOwner} />
      </div>

      {/* Playlist Content */}
      <div className="px-6 md:px-12 mt-6">
        <PlaylistContent
          songs={songs}
          PlaylistId={playlistId}
          isOwner={isOwner}
          userId={user?.id}
        />
      </div>

      <div className="mb-[10vh]" />
    </div>
  );
};

export default PlaylistPage;
