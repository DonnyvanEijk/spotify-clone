'use client';

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiOutlineTrash } from "react-icons/hi";
import { MdAccountCircle, MdOutlineModeEditOutline } from "react-icons/md";
import { Radio } from "@/types";
import { useUser } from "@/hooks/useUser";
import { useEditRadioModal } from "@/hooks/useEditRadioModal";
import { useDeleteRadioModal } from "@/hooks/useDeleteRadioModal";
import { useRouter } from "next/navigation";

const content = "min-w-[210px] overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50";
const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none data-[disabled]:opacity-35 data-[disabled]:pointer-events-none";
const danger = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none";
const sep = "my-1 h-px bg-white/8 mx-2";

interface RadioRightClickContentProps {
  radio: Radio;
}

const RadioRightClickContent: React.FC<RadioRightClickContentProps> = ({ radio }) => {
  const { user } = useUser();
  const editRadioModal = useEditRadioModal();
  const deleteRadioModal = useDeleteRadioModal();
  const router = useRouter();

  const isOwner = !!user && user.id === radio.user_id;

  return (
    <ContextMenu.Portal>
      <ContextMenu.Content className={content}>
        <ContextMenu.Item
          className={item}
          onClick={() => router.push(`/users/${radio.user_id}`)}
        >
          <MdAccountCircle size={15} /> Go to creator
        </ContextMenu.Item>

        {isOwner && (
          <>
            <ContextMenu.Separator className={sep} />

            <ContextMenu.Item className={item} onClick={() => editRadioModal.onOpen(radio.id)}>
              <MdOutlineModeEditOutline size={15} /> Edit station
            </ContextMenu.Item>

            <ContextMenu.Item className={danger} onClick={() => deleteRadioModal.onOpen(radio.id)}>
              <HiOutlineTrash size={15} /> Delete station
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
};

export default RadioRightClickContent;
