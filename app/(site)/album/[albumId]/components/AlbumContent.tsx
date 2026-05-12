"use client";

import { useRouter } from "next/navigation";
import { Song } from "@/types";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import useOnPlay from "@/hooks/useOnPlay";
import MediaItem from "@/components/media-item";
import { LikeButton } from "@/components/like-button";
import usePlayer from "@/hooks/usePlayer";
import PlaylistButton from "@/components/PlaylistButton";
import useReorderMode from "@/hooks/useReorderMode";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

interface SortableItemProps {
  song: Song;
  userId: string | undefined;
  activeId: string | undefined;
}

const SortableItem: React.FC<SortableItemProps> = ({ song, userId, activeId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-x-3 w-full bg-neutral-800/40 hover:bg-neutral-800/70 rounded-xl px-3 py-1 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-neutral-500 hover:text-white cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <MdDragIndicator size={22} />
      </button>
      <div className="flex-1 min-w-0">
        <MediaItem
          data={song}
          isOwner={song.user_id === userId}
          reactive={song.id === activeId}
          className=""
        />
      </div>
    </div>
  );
};

interface AlbumContentProps {
  songs: Song[];
  AlbumId: string;
  isOwner: boolean;
  userId: string | undefined;
  hasCustomOrder: boolean;
}

const AlbumContent: React.FC<AlbumContentProps> = ({
  songs,
  AlbumId,
  userId,
  hasCustomOrder,
}) => {
  const { activeId } = usePlayer();
  const router = useRouter();
  const { isLoading, user } = useUser();
  const reorderMode = useReorderMode();
  const supabaseClient = useSupabaseClient();

  const isReordering = reorderMode.isActive && reorderMode.id === AlbumId;

  const [localSongs, setLocalSongs] = useState<Song[]>(songs);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const onPlay = useOnPlay(localSongs);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalSongs((prev) => {
        const oldIdx = prev.findIndex((s) => s.id === active.id);
        const newIdx = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    const { error } = await (supabaseClient
      .from("albums")
      .update({ custom_order: localSongs.map((s) => s.id) })
      .eq("id", AlbumId) as any);
    setIsSaving(false);
    if (error) {
      toast.error("Failed to save order");
      return;
    }
    toast.success("Order saved!");
    reorderMode.onClose();
    router.refresh();
  };

  const handleClearOrder = async () => {
    setIsSaving(true);
    const { error } = await (supabaseClient
      .from("albums")
      .update({ custom_order: null })
      .eq("id", AlbumId) as any);
    setIsSaving(false);
    if (error) {
      toast.error("Failed to clear order");
      return;
    }
    toast.success("Custom order cleared");
    reorderMode.onClose();
    router.refresh();
  };

  const handleCancel = () => {
    setLocalSongs(songs);
    reorderMode.onClose();
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        <p>No songs in this album.</p>
      </div>
    );
  }

  if (isReordering) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex flex-wrap items-center gap-3 px-6">
          <p className="text-sm text-neutral-400 w-full mb-1">
            Drag songs to reorder, then save.
          </p>
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full text-sm font-semibold transition"
          >
            Save Order
          </button>
          {hasCustomOrder && (
            <button
              onClick={handleClearOrder}
              disabled={isSaving}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-full text-sm font-semibold transition"
            >
              Clear Custom Order
            </button>
          )}
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 hover:bg-white/10 disabled:opacity-50 text-neutral-400 hover:text-white rounded-full text-sm font-semibold transition"
          >
            Cancel
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSongs.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-y-2 w-full px-6">
              {localSongs.map((song) => (
                <SortableItem
                  key={song.id}
                  song={song}
                  userId={userId}
                  activeId={activeId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 w-full p-6">
      {localSongs.map((song) => (
        <div key={song.id} className="flex items-center gap-x-8 group w-full">
          <div className="flex-1">
            <MediaItem
              onClick={() => onPlay(song.id)}
              data={song}
              isOwner={song.user_id === userId}
              reactive={song.id === activeId}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex items-center gap-2">
            <PlaylistButton songId={song.id} />
            <LikeButton songId={song.id} creatorId={song.user_id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumContent;
