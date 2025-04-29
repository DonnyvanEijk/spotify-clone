import { Followers } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getCurrentlyFollowing = async (user_id:string): Promise<Followers[]> => {
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

export default getCurrentlyFollowing;