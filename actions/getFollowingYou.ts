import { createClient } from "@/lib/supabase/server";

const getFollowingYou = async (): Promise<any[]> => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const user_id = user.id;

  const { data: followersData, error: followersError } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('followed_id', user_id);

  if (followersError) {
    console.error(followersError);
    return [];
  }

  const followerIds = followersData?.map((f) => f.follower_id) || [];

  if (followerIds.length === 0) {
    return [];
  }

  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', followerIds);

  if (usersError) {
    console.error(usersError);
    return [];
  }

  return usersData || [];
};

export default getFollowingYou;
