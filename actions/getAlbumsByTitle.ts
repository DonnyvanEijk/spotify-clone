import { Album } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import getAlbums from "./getAlbums";

const getAlbumsByTitle = async (title: string): Promise<Album[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    if (!title)
    {
        const allAlbums = await getAlbums();
        return allAlbums;
    }

    const { data, error } = await supabase
    .from('albums')
    .select('*')
    .like('name', `%${title}%`)
    .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    }

    if (!data) {
        return [];
    }

    const remappedData = data.map((album: any) => ({
        ...album,
        image_path: album.image_patch,
        image_patch: undefined, // Remove the original image_patch property
    }));

    return remappedData;
}

export default getAlbumsByTitle;