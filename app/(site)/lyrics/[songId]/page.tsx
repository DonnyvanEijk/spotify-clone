'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import getSongsLyricsById from '@/actions/getSongLyricsById';
import { Header } from '@/components/header';

interface Props {
    params: {
        songId: string;
    };
}

interface Lyrics {
    id: string;
    lyrics: string;
}

const LyricsPage: React.FC<Props> = ({ params }) => {
    const supabaseClient = useSupabaseClient();
    const [lyrics, setLyrics] = useState<Lyrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLyrics = async () => {
            const lyricsData = await getSongsLyricsById(supabaseClient, params.songId);
            if (!(lyricsData instanceof Error)) {
                //@ts-expect-error Its working so dont touch hehehe
                setLyrics(lyricsData);
            }
            setLoading(false);
        };

        fetchLyrics();
    }, [supabaseClient, params.songId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col w-full bg-green-500 p-6 rounded-lg gap-3 mb-[5rem]">
             <Header className='bg-gradient-to-b from-green-500 p-6 no-drop-shadow'>  
                <h2 className='font-semibold text-2xl'>Lyrics</h2>
            </Header>
            {Array.isArray(lyrics) && lyrics.length > 0 ? (
                lyrics.map((data) => (
                    data.lyrics.split('\n').map((line, index) => (
                        <p className="font-bold text-[2.8rem]" key={`${data.id}-${index}`}>
                            {line}
                        </p>
                    ))
                ))
            ) : (
                <div className="flex justify-center items-center h-[100vh]">
                    <p className="text-center font-semibold text-[1.5rem]">This song has no lyrics.</p>
                </div>
            )}
        </div>
    );
};

export default LyricsPage;