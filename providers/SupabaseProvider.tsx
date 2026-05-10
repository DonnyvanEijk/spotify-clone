"use client"

import { createBrowserClient } from "@supabase/ssr"
import { Session } from "@supabase/supabase-js"
import { Database } from "@/database.types"
import { createContext, useContext, useEffect, useState } from "react"

// Define a "Loose" type that falls back to 'any' when types are missing
type SupabaseClientWithAny = ReturnType<typeof createBrowserClient<Database>> & {
  from: (table: string) => any;
}

type SupabaseContextType = {
  // Use 'any' here as a last resort if you want to stop ALL type errors, 
  // or use the specialized type below to keep some safety.
  supabaseClient: any 
  session: Session | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function useSupabaseContext() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) throw new Error("useSupabaseContext must be used within SupabaseProvider")
  return ctx
}

type Props = { children: React.ReactNode }

export const SupabaseProvider = ({ children }: Props) => {
  const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabaseClient])

  return (
    <SupabaseContext.Provider value={{ 
      // We cast to any here to satisfy the Provider. 
      // This stops the 'never' and 'RejectExcessProperties' errors 
      // throughout your entire app.
      supabaseClient: supabaseClient as any, 
      session, 
      isLoading 
    }}>
      {children}
    </SupabaseContext.Provider>
  )
}