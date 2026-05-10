"use server"
import { Album } from "@/types";
import { createClient } from "@/lib/supabase/server";

const getAlbums = async (): Promise<Album[]> => {
  const supabase = await createClient();

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

  return data.map((album: any) => ({ ...album, image_path: album.image_path }));
};

export default getAlbums;
