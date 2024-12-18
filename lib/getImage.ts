import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getImage = async (path: string) => {
    if (!path) {
        return null;
    }

    const supabase = createServerComponentClient({
        cookies: cookies
    });

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