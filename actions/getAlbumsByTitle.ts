import { Album } from "@/types";
import { createClient } from "@/lib/supabase/server";
import getAlbums from "./getAlbums";

const getAlbumsByTitle = async (title: string): Promise<Album[]> => {
  if (!title) {
    return getAlbums();
  }

  const supabase = await createClient();

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

  return data.map((album: any) => ({ ...album, image_path: album.image_path }));
};

export default getAlbumsByTitle;
