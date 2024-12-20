"use client"

import AddLyricsModal from "@/components/AddLyricsModal"
import AddToPlaylistModal from "@/components/AddToPlaylistModal"
import AuthModal from "@/components/auth-modal"
import BatchAddToPlaylistModal from "@/components/BatchAddToPlaylistModal"
import ClonePlaylistModal from "@/components/ClonePlaylistModal"
import CreatePlaylistModal from "@/components/CreatePlaylistModal"
import DeletePlaylistModal from "@/components/DeletePlaylistModal"
import DeleteSongModal from "@/components/DeleteSongModal"
import PlaylistEditModal from "@/components/EditPlaylistModal"
import SongEditModal from "@/components/EditSongModal"
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