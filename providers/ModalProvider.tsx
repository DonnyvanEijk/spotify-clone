"use client"

import AddLyricsModal from "@/components/modals/AddLyricsModal"
import AddToPlaylistModal from "@/components/modals/AddToPlaylistModal"
import AuthModal from "@/components/modals/auth-modal"
import BatchAddToPlaylistModal from "@/components/modals/BatchAddToPlaylistModal"
import ClonePlaylistModal from "@/components/modals/ClonePlaylistModal"
import CreateAlbumModal from "@/components/modals/CreateAlbumModal"
import CreateExistingRadioModal from "@/components/modals/CreateExistingRadioModal"
import CreatePlaylistModal from "@/components/modals/CreatePlaylistModal"
import DeleteAlbumModal from "@/components/modals/DeleteAlbumModal"
import DeletePlaylistModal from "@/components/modals/DeletePlaylistModal"
import DeleteSongModal from "@/components/modals/DeleteSongModal"
import AlbumEditModal from "@/components/modals/EditAlbumModal"
import PlaylistEditModal from "@/components/modals/EditPlaylistModal"
import SongEditModal from "@/components/modals/EditSongModal"
import ShareSongModal from "@/components/modals/SharedSongModal"
import { SubscribeModal } from "@/components/modals/SubscribeModal"
import  UploadModal from "@/components/modals/upload-modal"
import UploadAlbumModal from "@/components/modals/UploadAlbumModal"
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
            <ShareSongModal/>
            <UploadModal />
            <SubscribeModal products={products} />
            <UploadAlbumModal/>
            <CreatePlaylistModal />
            <CreateExistingRadioModal/>
            <AddToPlaylistModal />
            <DeletePlaylistModal />
            <DeleteSongModal />
            <DeleteAlbumModal />
            <SongEditModal />
            <AddLyricsModal />
            <PlaylistEditModal />
            <BatchAddToPlaylistModal />
            <ClonePlaylistModal />
            <CreateAlbumModal />
            <AlbumEditModal />
    
        </>
    )
}