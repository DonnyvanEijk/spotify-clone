"use client"


import { useRouter } from "next/navigation"
import { Modal } from "./modal"
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useAuthModal } from "@/hooks/useAuthModal"
import { useEffect } from "react"

export const AuthModal = () => {
    const supabaseClient = useSupabaseClient()
    const router = useRouter();
    const { session } = useSessionContext()
    const {onClose, isOpen} = useAuthModal()

    useEffect(() => {
        if(session) {
            router.refresh()
            onClose();
        }
    }, [session, router, onClose])
    const onChange = (open:boolean) => {
        if(!open) {
            onClose()
        }
    }
return (
    <Modal title="Welome back!" description="Log in to your account" isOpen={isOpen} onChange={onChange}>
        <Auth supabaseClient={supabaseClient} magicLink providers={[]} theme="dark" appearance={{
            theme: ThemeSupa,
            variables: {
               
                default: {
                    colors: {
                        brand: "#404040",
                        brandAccent: "#22c55e"
                    }
                }
            }
        }}/>
    </Modal>
)
}