import { Album } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getAlbums = async (): Promise<Album[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from('albums')
        .select('*')
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

export default getAlbums;

