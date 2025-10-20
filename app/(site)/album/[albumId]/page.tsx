import React from "react";
import getAlbum from "@/actions/getAlbum";
import { getImage } from "@/lib/getImage";
import Image from "next/image";
import getAlbumSongs from "@/actions/getAlbumSongs";
import AlbumContent from "./components/AlbumContent";
import ShuffleControl from "./components/Controls";
import getUser from "@/actions/getUser";
import { Header } from "@/components/header";
import { getUserById } from "@/actions/getUsers";

export const revalidate = 0;

type Props = {
  params: {
    albumId: string;
  };
};

const AlbumPage = async ({ params }: Props) => {
  const user = await getUser();
  const albumId = params.albumId;
  const album = await getAlbum(albumId);
  const imagePath = await getImage(album.image_path);
  const songs = await getAlbumSongs(albumId);
  const isOwner = user ? album.user_id === user.id : false;
  const currentUserData = await getUserById(user?.id as string);
  const avatarImage = await getImage(currentUserData?.avatar_url || "");

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      {/* Header with Album Info */}
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            {/* Album Cover */}
            <div className="relative h-32 w-32 md:h-44 md:w-44 lg:h-52 lg:w-52 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20">
              <Image
                fill
                src={imagePath || "/images/liked.png"}
                alt={album.name}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Album Details */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-purple-400 font-semibold text-sm">Album</span>
              <h1 className="text-white pb-2 font-bold text-4xl sm:text-5xl lg:text-6xl truncate">
                {album.name}
              </h1>
              <p className="text-neutral-400 font-medium text-sm">By {album.author}</p>
              <p className="text-neutral-400 mt-2 font-semibold">{songs.length} songs</p>
            </div>
          </div>
        </div>
      </Header>

      {/* Shuffle Control */}
      <div className="px-6 md:px-12 mt-6">
        <ShuffleControl songs={songs} isOwner={isOwner} albumId={albumId} />
      </div>

      {/* Album Content */}
      <div className="px-6 md:px-12 mt-6">
        <AlbumContent
          songs={songs}
          AlbumId={albumId}
          isOwner={isOwner}
          userId={user?.id}
        />
      </div>

      <div className="mb-[10vh]" />
    </div>
  );
};

export default AlbumPage;
