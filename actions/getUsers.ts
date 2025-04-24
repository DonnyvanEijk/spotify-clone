import { UserDetails } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getUsersIndex = async (): Promise<UserDetails[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from('users')
        .select('*'); 

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }
    return data 
}

export default getUsersIndex;