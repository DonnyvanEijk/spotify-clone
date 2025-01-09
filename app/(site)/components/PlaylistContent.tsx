
import PlaylistItem from "@/components/PlaylistItem";
import { Playlist } from "@/types";

interface PlaylistContentProps {
    playlists: Playlist[];
    userId: string | undefined;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ playlists, userId }) => {
    if (playlists.length === 0) {
        return (
            <div className="mt-4 text-neutral-400">
                No Playlists Available
            </div>
        )
    }
    return (
        <div className="grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-3 
          lg:grid-cols-4 
          xl:grid-cols-5 
          2xl:grid-cols-8 
          gap-4 
          mt-4">
            {playlists.slice(0, 16).map((item) => (
                <PlaylistItem
                    isOwner={item.user_id === userId}
                    key={item.id}
                    data={item}
                />
            ))}
            
        </div>
    );
}

export default PlaylistContent;