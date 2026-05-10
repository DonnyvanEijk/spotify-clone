import { useSupabaseContext } from "@/providers/SupabaseProvider"

export function useSessionContext() {
  const { supabaseClient, session, isLoading } = useSupabaseContext()
  return { session, isLoading, supabaseClient, error: null }
}
