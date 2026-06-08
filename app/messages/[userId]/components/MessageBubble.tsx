"use client";

import { Message } from "@/types";
import { HiPlay } from "react-icons/hi";
import { HiMusicNote } from "react-icons/hi";
import usePlayer from "@/hooks/usePlayer";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";

interface Props {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  avatarUrl: string | null;
  senderName: string;
}

export function MessageBubble({ message, isMine, showAvatar, showTimestamp, avatarUrl, senderName }: Props) {
  const player = usePlayer();
  const supabase = useSupabaseClient();

  const songImageUrl = message.song?.image_path
    ? supabase.storage.from("images").getPublicUrl(message.song.image_path).data.publicUrl
    : null;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar (only for partner messages) */}
      <div className="w-7 h-7 shrink-0">
        {!isMine && showAvatar && (
          <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-neutral-400">
                {senderName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`flex flex-col max-w-[72%] gap-1 ${isMine ? "items-end" : "items-start"}`}>
        {/* Song embed */}
        {message.song && (
          <div className="bg-white/8 border border-white/10 rounded-2xl overflow-hidden w-56">
            {songImageUrl && (
              <img src={songImageUrl} alt={message.song.title} className="w-full h-28 object-cover" />
            )}
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{message.song.title}</p>
                <p className="text-xs text-neutral-400 truncate">{message.song.author}</p>
              </div>
              <button
                onClick={() => {
                  if (player.activeId === message.song!.id) {
                    window.dispatchEvent(new Event("restartCurrentSong"));
                  } else {
                    player.insertAfterCurrent(message.song!.id);
                  }
                }}
                className="shrink-0 w-7 h-7 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center transition-colors"
              >
                <HiPlay size={12} className="text-black ml-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
              isMine
                ? "bg-purple-600 text-white rounded-br-sm"
                : "bg-white text-black rounded-bl-sm"
            }`}
          >
            {message.content}
          </div>
        )}

        {showTimestamp && <span className="text-[10px] text-neutral-600 px-1">{time}</span>}
      </div>
    </div>
  );
}
