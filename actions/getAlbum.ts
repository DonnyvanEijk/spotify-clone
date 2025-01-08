import { Album } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getAlbum = async (id: string): Promise<Album> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();

    const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .order('created_at', { ascending: false })
        .single();

    if (error) {
        console.error(error);
    }

    if (!data) {
        throw new Error("Album not found.");
        // throw new Error("You do not have access to this playlist.");
        // toast.error("You do not have access to this playlist.");
    }

    if (data.user_id !== session?.user.id && !data.ispublic) {
        redirect('/');
    }

    const remappedData = {
        ...data,
        image_path: data.image_path,
    };
    delete remappedData.image_path;

    return remappedData;
}

export default getAlbum;