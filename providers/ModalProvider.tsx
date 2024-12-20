"use client"

import AddLyricsModal from "@/components/modals/AddLyricsModal"
import AddToPlaylistModal from "@/components/modals/AddToPlaylistModal"
import AuthModal from "@/components/modals/auth-modal"
import BatchAddToPlaylistModal from "@/components/modals/BatchAddToPlaylistModal"
import ClonePlaylistModal from "@/components/modals/ClonePlaylistModal"
import CreatePlaylistModal from "@/components/modals/CreatePlaylistModal"
import DeletePlaylistModal from "@/components/modals/DeletePlaylistModal"
import DeleteSongModal from "@/components/modals/DeleteSongModal"
import PlaylistEditModal from "@/components/modals/EditPlaylistModal"
import SongEditModal from "@/components/modals/EditSongModal"
import { SubscribeModal } from "@/components/modals/SubscribeModal"
import { UploadModal } from "@/components/modals/upload-modal"
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
            <DeletePlaylistModal/>
            <DeleteSongModal/>
            <SongEditModal/>
            <AddLyricsModal/>
            <PlaylistEditModal />
            <BatchAddToPlaylistModal />
            <ClonePlaylistModal />
    
        </>
    )
}