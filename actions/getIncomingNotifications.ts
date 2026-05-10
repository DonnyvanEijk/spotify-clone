import { Notification } from "@/types";
import { createClient } from "@/lib/supabase/server";

export const getIncomingNotifications = async (user_id: string): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('target_id', user_id)
    .is('deleted_at', null);

  if (error) {
    console.error(error);
    return 0;
  }

  return count || 0;
};

export const getIncomingNotificationsData = async (user_id: string): Promise<Notification[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('target_id', user_id)
    .is('deleted_at', null);

  if (error) {
    console.error(error);
    return [];
  }

  return (data as Notification[]) || [];
};
