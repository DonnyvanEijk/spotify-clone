import { Followers } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getFollowedUsers = async (user_id: string): Promise<any[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
    .from('followers')
    .select('followed_id')
    .eq('follower_id', user_id)
    .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    const userIds = data?.map((item: any) => item.followed_id) || [];

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

    if (userError) {
        console.error(userError);
        return [];
    }

    return userData || [];
};

const getCurrentlyFollowing = async (user_id: string): Promise<Followers[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
    }

    return (data as any) || [];
}


export { getCurrentlyFollowing, getFollowedUsers };