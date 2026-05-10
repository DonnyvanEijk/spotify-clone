import { createClient } from "@/lib/supabase/server";

export const getImage = async (path: string) => {
    if (!path) {
        return null;
    }

    const supabase = await createClient();

    const { data: imageData } = await supabase
        .storage
        .from('images')
        .getPublicUrl(path);

    if (!imageData) {
        console.error('Error fetching image data');
        return null;
    }

    return imageData.publicUrl;
}