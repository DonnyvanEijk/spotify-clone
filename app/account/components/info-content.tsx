"use client"

import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { ListItem } from "@/components/list-item"
import { useSubscribeModal } from "@/hooks/useSubscribeModal"
import { useUser } from "@/hooks/useUser"
import { postData } from "@/lib/helper"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export const InfoContent = () => {

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
            <h1 className="text-2xl font-bold text-white mb-5">Account information</h1>
            
            <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-4">
                    <p className="font-semibold text-lg">Email adress</p>
                    <Input className="w-[300px] text-white" placeholder={user?.email} value={user?.email}/>
                    </div>

                    <div className="flex flex-col gap-y-4">
                    <p className="font-semibold text-lg">Liked songs</p>
                    <ListItem name='Liked Songs' image='/images/liked.png' href='/liked' classname="w-[300px]" />
                    </div>
            </div>
                    
                
            
           
        </div>
    )
}