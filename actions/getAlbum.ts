import { Album } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const getAlbum = async (id: string): Promise<Album> => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

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
  }

  if (data.user_id !== user?.id && !data.ispublic) {
    redirect('/');
  }

  return { ...data, image_path: data.image_path };
};

export default getAlbum;
