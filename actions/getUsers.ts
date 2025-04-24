import { UserDetails } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getUsersIndex = async (): Promise<UserDetails[]> => {
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

    // Sort users by whether they have a username
    return data.sort((a, b) => {
        if (a.username && !b.username) return -1;
        if (!a.username && b.username) return 1;
        return 0;
    });
}

export const getUserById = async (id: string): Promise<UserDetails | null> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching users:", error);
        return null;
    }

    return data;
}

