'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import getSongsLyricsById from '@/actions/getSongLyricsById';

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
        <div className="flex flex-col w-full bg-green-500 p-6 rounded-lg gap-3">
            {Array.isArray(lyrics) ? (
                lyrics.map((data) => (
                    data.lyrics.split('\n').map((line, index) => (
                        <p className="font-bold text-[2.8rem]" key={`${data.id}-${index}`}>
                            {line}
                        </p>
                    ))
                ))
            ) : (
                <p>No lyrics found.</p>
            )}
        </div>
    );
};

export default LyricsPage;