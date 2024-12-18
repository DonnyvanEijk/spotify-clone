"use client"

import AddToPlaylistModal from "@/components/AddToPlaylistModal"
import AuthModal from "@/components/auth-modal"
import CreatePlaylistModal from "@/components/CreatePlaylistModal"
import { SubscribeModal } from "@/components/SubscribeModal"
import { UploadModal } from "@/components/upload-modal"
import { ProductWithPrice } from "@/types"
import { useEffect, useState } from "react"

type Props = {
    products: ProductWithPrice[];
}

export const ModalProvider: React.FC<Props> = ({ products }) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <>
            <AuthModal />
            <UploadModal />
            <SubscribeModal products={products} />
            <CreatePlaylistModal />
            <AddToPlaylistModal />
        </>
    )
}