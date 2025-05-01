import { Notification } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getIncomingNotifications = async (user_id: string): Promise<number> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' }) // Use 'exact' to get the count
        .eq('target_id', user_id)
        .is('deleted_at', null)

    if (error) {
        console.error(error);
        return 0; // Return 0 in case of an error
    }

    return count || 0; // Return the count or 0 if undefined
}

export const getIncomingNotificationsData = async (user_id: string): Promise<Notification[]> => {
    const supabase = createServerComponentClient({
        cookies: cookies
    });

    const { data, error } = await supabase
        .from('notifications')
        .select('*') // Fetch all fields to match the Notification type
        .eq('target_id', user_id)
        .is('deleted_at', null)

    if (error) {
        console.error(error);
        return []; // Return 0 in case of an error
    }

    return data as Notification[] || []; // Cast the data to Notification[]
}


