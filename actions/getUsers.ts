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
    return data;
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

