"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AiOutlinePlus, AiOutlineUpload } from "react-icons/ai";
import { HiOutlineChevronUp } from "react-icons/hi";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUploadModal } from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useCreateAlbumModal } from "@/hooks/useCreateAlbumModal";
import { useUploadAlbumModal } from "@/hooks/useUploadAlbumModal";

const item = "flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none";

const LibraryDropdown = () => {
  const subscribeModal = useSubscribeModal();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const createPlaylistModal = useCreatePlaylistModal();
  const uploadAlbumModal = useUploadAlbumModal();
  const createAlbumModal = useCreateAlbumModal();
  const { user, subscription } = useUser();

  const guard = (requiresSub: boolean, action: () => void) => {
    if (!user) return authModal.onOpen();
    if (requiresSub && !subscription) return subscribeModal.onOpen();
    action();
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="focus:outline-none group" aria-label="Library actions">
          <HiOutlineChevronUp
            size={16}
            className="text-neutral-400 group-hover:text-white group-data-[state=open]:rotate-180 transition-all duration-150"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-52.5 overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item className={item} onClick={() => guard(true, uploadModal.onOpen)}>
            Upload song <AiOutlineUpload size={15} className="text-neutral-500" />
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onClick={() => guard(false, createPlaylistModal.onOpen)}>
            New playlist <AiOutlinePlus size={15} className="text-neutral-500" />
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onClick={() => guard(true, createAlbumModal.onOpen)}>
            New album <AiOutlinePlus size={15} className="text-neutral-500" />
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onClick={() => guard(true, uploadAlbumModal.onOpen)}>
            Upload album <AiOutlineUpload size={15} className="text-neutral-500" />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default LibraryDropdown;
