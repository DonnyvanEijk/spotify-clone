import Image from "next/image";

import useLoadPlaylistImage from "@/hooks/useLoadPlaylistImage";
import { Playlist } from "@/types";

type PlaylistImageProps = {
    playlist: Playlist | null;
};

const PlaylistImage: React.FC<PlaylistImageProps> = ({ playlist }) => {

    const imagePath = useLoadPlaylistImage(playlist);

    return (
        <div className="w-full flex flext-row justify-center">
            <Image
                src={imagePath || '/images/liked.png'}
                alt="Playlist Image"
                width={200}
                height={200}
            />
        </div>
    );
}

export default PlaylistImage;