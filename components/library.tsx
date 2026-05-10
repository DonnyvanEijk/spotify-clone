import { Song } from "@/types";
import MediaItem from "./media-item";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import LibraryDropdown from "./LibraryDropdown";
import { HiOutlineMusicNote } from "react-icons/hi";

type Props = {
  songs: Song[];
  userId: string | undefined;
}

export const Library = ({ songs, userId }: Props) => {
  const onPlay = useOnPlay(songs);
  const { activeId } = usePlayer();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 shrink-0">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Your Library</p>
        <LibraryDropdown />
      </div>

      <div className="flex flex-col gap-1 px-2 pb-2 overflow-y-auto flex-1 no-scrollbar">
        {!userId ? (
          <p className="text-neutral-500 text-xs px-2 py-4 text-center">Sign in to see your library</p>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-600">
            <HiOutlineMusicNote size={24} />
            <p className="text-xs">No songs yet</p>
          </div>
        ) : songs.map((item) => (
          <MediaItem
            reactive={activeId === item.id}
            onClick={(id: string) => onPlay(id)}
            key={item.id}
            data={item}
            isOwner={item.user_id === userId}
          />
        ))}
      </div>
    </div>
  );
};
