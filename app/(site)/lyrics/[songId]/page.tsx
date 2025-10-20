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
        return (
            <div className="flex justify-center items-center h-[80vh] text-purple-200">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full p-6 gap-6 mb-[5rem]">
            <Header className="bg-white/10 backdrop-blur-[18px] rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                <h2 className="font-semibold text-3xl text-purple-200">Lyrics</h2>
            </Header>

            {Array.isArray(lyrics) && lyrics.length > 0 ? (
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/10 backdrop-blur-[18px] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                    {lyrics.map((data) =>
                        data.lyrics.split('\n').map((line, index) => (
                            <p
                                className="font-bold text-[2rem] text-purple-100 break-words"
                                key={`${data.id}-${index}`}
                            >
                                {line}
                            </p>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex justify-center items-center h-[60vh]">
                    <p className="text-center font-semibold text-[1.5rem] text-purple-200">
                        This song has no lyrics.
                    </p>
                </div>
            )}
        </div>
    );
};

export default LyricsPage;
