import { UserDetails } from "@/types";
import { createClient } from "@/lib/supabase/server";

export const getUsersIndex = async (): Promise<UserDetails[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data.sort((a, b) => {
    if (a.username && !b.username) return -1;
    if (!a.username && b.username) return 1;
    return 0;
  });
};

export const getUserById = async (id: string): Promise<UserDetails | null> => {
  const supabase = await createClient();

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
};
