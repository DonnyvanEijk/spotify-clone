import { createClient } from "@/lib/supabase/server";

const getFollowerAmount = async (user_id: string): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('followers')
    .select('id', { count: 'exact' })
    .eq('followed_id', user_id);

  if (error) {
    console.error(error);
    return 0;
  }

  return count || 0;
};

export default getFollowerAmount;
