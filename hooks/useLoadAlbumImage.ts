import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { Album } from "@/types";

const useLoadAlbumImage = (album: Album | null) => {
    const supabaseClient = useSupabaseClient();

    if (!album) {
        return null;
    }

    const { data: imageData } = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(album.image_path);
    console.log(album.image_path)
    return imageData.publicUrl;
}

export default useLoadAlbumImage;