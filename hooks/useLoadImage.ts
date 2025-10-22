import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song, Radio } from "@/types";



const useLoadImage = (item: Song | Radio | null) => {
  const supabaseClient = useSupabaseClient();

  if (!item?.image_path) {
    return null;
  }

  const { data: imageData } = supabaseClient.storage
    .from("images")
    .getPublicUrl(item.image_path);

  return imageData?.publicUrl ?? null;
};

export default useLoadImage;
