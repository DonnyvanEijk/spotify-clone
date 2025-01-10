"use client"

import { Button } from "@/components/button"
import { useSubscribeModal } from "@/hooks/useSubscribeModal"
import { useUser } from "@/hooks/useUser"
import { postData } from "@/lib/helper"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export const BillingContent = () => {

    const router = useRouter()
    const subscribeModal = useSubscribeModal()
    const {isLoading, subscription, user} = useUser()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if(!isLoading && !user) {
            router.replace('/')
        }
    }, [isLoading, user, router])

    const redirectToCustomerPortal = async () => {
        setLoading(true)
        try {
            const {url
            } = await postData({
                url: '/api/create-portal-link',
            });
            window.location.assign(url)
        } catch (error) {
           toast.error((error as Error).message)
        }
        setLoading(false)
    }
    return(
        <div className="mb-7 px-6">
            <h1 className="text-2xl font-bold text-white mb-5">Billing information</h1>
            {
                !subscription && (
                    <div className="flex flex-col gap-y-4">
                        <p>No active plan.</p>
                        <Button onClick={subscribeModal.onOpen} className="w-[300px]">
                            Subscribe
                        </Button>
                    </div>
                )
            }
            {
                subscription && (
                    <div className="flex flex-col gap-y-4">
                    <p>You are currently on the <b>{subscription?.prices?.products?.name}</b> plan.</p>
                    <Button disabled={loading || isLoading} className="w-[300px]" onClick={redirectToCustomerPortal}>
                     Open customer menu
                    </Button>
                    </div>
                )
            }
           
        </div>
    )
}