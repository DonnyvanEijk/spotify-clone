import { useSupabaseClient } from '@/hooks/useSupabaseClient';

const useLoadAvatar = (url:string) => {
  const supabaseClient = useSupabaseClient();

  if (!url) {
    return null;
  }

  const { data: imageData } = supabaseClient.storage
    .from('images')
    .getPublicUrl(url);

  return imageData.publicUrl;
};

export default useLoadAvatar;