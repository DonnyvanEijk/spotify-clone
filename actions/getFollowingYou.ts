import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getFollowingYou = async (): Promise<any[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user) {
        throw new Error("User is not authenticated");
    }

    const user_id = session.user.id;

    // Fetch all follower IDs
    const { data: followersData, error: followersError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('followed_id', user_id);

    if (followersError) {
        console.error(followersError);
        return []; // Return an empty array in case of an error
    }

    const followerIds = followersData?.map((follower) => follower.follower_id) || [];

    if (followerIds.length === 0) {
        return []; // Return an empty array if no followers are found
    }

    // Fetch user details for all follower IDs
    const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', followerIds);

    if (usersError) {
        console.error(usersError);
        return []; // Return an empty array in case of an error
    }

    return usersData || []; // Return the user data or an empty array if undefined
}

export default getFollowingYou;
