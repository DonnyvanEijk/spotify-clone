import { Song } from "@/types"
import { TbPlaylist } from "react-icons/tb"
import MediaItem from "./media-item"
import useOnPlay from "@/hooks/useOnPlay"
import usePlayer from "@/hooks/usePlayer"
import LibraryDropdown from "./LibraryDropdown"


type Props  = {
    songs: Song[]
    userId: string | undefined
}
export const Library = ({songs, userId}:Props) => {

    const onPlay = useOnPlay(songs)
    const {activeId} = usePlayer()

   
    return(
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4">
                <div className="inline-flex items-center gap-x-2">
                    <TbPlaylist className="text-neutral-400" size={26}/>
                    <p className="text-neutral-400 font-medium text-md">
                        Your Library
                    </p>
                </div>
              <LibraryDropdown/>
            </div>
            <div className='flex flex-col gap-y-2 mt-4 px-3'>
        {songs.map((item) => (
          <MediaItem
            reactive={activeId === item.id}
            onClick={(id: string) => {onPlay(id)}}
            key={item.id}
            data={item}
            isOwner={item.user_id === userId}
          />
        ))}
      </div>
        </div>
    )
    
}