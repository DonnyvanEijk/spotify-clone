import { useSupabaseContext } from "@/providers/SupabaseProvider"

export function useSupabaseClient() {
  return useSupabaseContext().supabaseClient
}
