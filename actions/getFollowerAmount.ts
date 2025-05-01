import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getFollowerAmount = async (user_id: string): Promise<number> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { count, error } = await supabase
        .from('followers')
        .select('id', { count: 'exact' }) // Use 'exact' to get the count
        .eq('followed_id', user_id);

    if (error) {
        console.error(error);
        return 0; // Return 0 in case of an error
    }

    return count || 0; // Return the count or 0 if undefined
}

export default getFollowerAmount;
