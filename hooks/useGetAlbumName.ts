import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const useGetAlbumName = (albumId: string) => {
    const [albumName, setAlbumName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseClient = useSupabaseClient()

    useEffect(() => {
        const fetchAlbumName = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('albums')
                    .select('*')
                    .eq('id', albumId)
                    .single();

                if (error) {
                    console.error("Error fetching album name: ", error);
                    toast.error("Failed to fetch album name");
                    return;
                }
                setAlbumName(data.name);
            } catch (err) {
                setError('Failed to fetch album name');
            } finally {
                setLoading(false);
            }
        };
        if (albumId) {
            fetchAlbumName();
        }
    }, [albumId]);

    return { albumName, loading, error };
};

export default useGetAlbumName;