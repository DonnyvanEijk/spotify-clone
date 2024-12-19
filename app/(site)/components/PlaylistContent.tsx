
import PlaylistItem from "@/components/PlaylistItem";
import { Playlist } from "@/types";

interface PlaylistContentProps {
    playlists: Playlist[];
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ playlists }) => {
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
                    key={item.id}
                    data={item}
                />
            ))}
        </div>
    );
}

export default PlaylistContent;