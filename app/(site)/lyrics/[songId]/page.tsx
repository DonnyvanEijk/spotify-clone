"use client"
import getSongsLyricsById from "@/actions/getSongLyricsById";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type Props = {
    params: {
        songId: string;
    };
}

const LyricsPage = async ({params}:Props) => {
    const supabaseClient = useSupabaseClient();
    const lyrics = await getSongsLyricsById(supabaseClient, params.songId);
  
    return ( 
        <div className="flex flex-col w-full  bg-green-500 p-6 rounded-lg  gap-3">
            {Array.isArray(lyrics) ? (
                lyrics.map((data:any) => (
                    data.lyrics.split('\n').map((line: string, index: number) => (
                        <p className="font-bold text-[2.8rem]" key={`${data.id}-${index}`}>
                            {line}
                        </p>
                    ))
                ))
            ) : (
                <p>Error loading lyrics</p>
            )}
        </div>
     );
}
 
export default LyricsPage;