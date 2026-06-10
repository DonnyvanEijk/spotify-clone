"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Message } from "@/types";
import { HiPlay, HiDotsVertical, HiOutlinePencil, HiOutlineTrash, HiReply, HiOutlineClipboardCopy } from "react-icons/hi";
import usePlayer from "@/hooks/usePlayer";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { detectGif } from "@/utils/gifDetector";
import { emojiOnlyCount } from "@/utils/emojiShortcodes";
import { isImageDataUrl, copyImageToClipboard } from "@/utils/imageCompress";

interface Props {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  avatarUrl: string | null;
  senderName: string;
  myId: string;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onScrollToMessage: (id: string) => void;
  onOpenImage: (src: string) => void;
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;

function renderWithLinks(text: string, linkClass: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-2 hover:opacity-75 transition-opacity ${linkClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MessageBubbleComponent({
  message, isMine, showAvatar, showTimestamp,
  avatarUrl, senderName, myId, onReply, onEdit, onDelete, onScrollToMessage, onOpenImage,
}: Props) {
  const player = usePlayer();
  const supabase = useSupabaseClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const songImageUrl = message.song?.image_path
    ? supabase.storage.from("images").getPublicUrl(message.song.image_path).data.publicUrl
    : null;

  // Inline image sent via drag-and-drop (stored as a data-URI in content).
  const imageData = !message.is_deleted && isImageDataUrl(message.content) ? message.content! : null;
  const replyImage =
    message.reply_to && !message.reply_to.is_deleted && isImageDataUrl(message.reply_to.content)
      ? message.reply_to.content!
      : null;

  const gif = !message.is_deleted && !imageData && message.content ? detectGif(message.content) : null;

  // Render short emoji-only messages large, with no bubble background.
  const jumboCount = !message.is_deleted && !imageData && message.content && !gif && !message.song
    ? emojiOnlyCount(message.content)
    : 0;
  const isJumbo = jumboCount > 0 && jumboCount <= 3;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleCopyImage = async () => {
    setMenuOpen(false);
    if (!imageData) return;
    try {
      await copyImageToClipboard(imageData);
    } catch {
      // Clipboard unavailable or permission denied — ignore.
    }
  };

  const actions = !message.is_deleted && (
    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="p-1 rounded-lg text-neutral-600 hover:text-white hover:bg-white/10 transition-all"
        title="Options"
      >
        <HiDotsVertical size={14} />
      </button>

      {menuOpen && (
        <div className={`absolute bottom-full mb-1 z-50 bg-neutral-900 border border-white/15 rounded-xl shadow-xl overflow-hidden min-w-30 ${isMine ? "right-0" : "left-0"}`}>
          <button
            onClick={() => { onReply(message); setMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/8 transition-colors"
          >
            <HiReply size={13} /> Reply
          </button>
          {imageData && (
            <button
              onClick={handleCopyImage}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/8 transition-colors"
            >
              <HiOutlineClipboardCopy size={13} /> Copy image
            </button>
          )}
          {isMine && (
            <>
              {/* Images/GIFs aren't text-editable */}
              {!imageData && !gif && (
                <button
                  onClick={() => { onEdit(message); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <HiOutlinePencil size={13} /> Edit
                </button>
              )}
              <button
                onClick={() => { onDelete(message); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <HiOutlineTrash size={13} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`group flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar slot */}
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

      {/* Three-dot menu — renders on the outer side of the bubble */}
      {actions}

      {/* Bubble column */}
      <div className={`flex flex-col max-w-[68%] gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        {/* Reply preview — click to jump to original */}
        {message.reply_to && (
          <button
            onClick={() => message.reply_to_id && onScrollToMessage(message.reply_to_id)}
            className="flex items-center gap-2 border-l-2 border-purple-500/60 bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1.5 mb-0.5 max-w-full text-left transition-colors cursor-pointer"
          >
            {replyImage && (
              <img
                src={replyImage}
                alt=""
                className="w-8 h-8 rounded object-cover shrink-0"
                decoding="async"
              />
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-purple-400 mb-0.5">
                {message.reply_to.sender_id === myId ? "You" : senderName}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {message.reply_to.is_deleted
                  ? "Message deleted"
                  : message.reply_to.content
                    ? replyImage
                      ? "Photo"
                      : detectGif(message.reply_to.content) ? "🎞 GIF" : message.reply_to.content
                    : "🎵 Song"}
              </p>
            </div>
          </button>
        )}

        {/* Song embed */}
        {message.song && !message.is_deleted && (
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

        {/* Text bubble or deleted state */}
        {message.is_deleted ? (
          <div className="px-3 py-2 rounded-2xl text-sm border border-white/10 text-neutral-500 italic">
            Message deleted
          </div>
        ) : imageData ? (
          /* Inline image (drag-and-dropped) */
          <img
            src={imageData}
            alt="Image"
            loading="lazy"
            decoding="async"
            onClick={() => onOpenImage(imageData)}
            className="rounded-2xl max-w-65 w-full cursor-zoom-in hover:opacity-90 transition-opacity"
          />
        ) : (
          <>
            {/* GIF embed */}
            {gif && (
              <img
                src={gif.url}
                alt="GIF"
                loading="lazy"
                className="rounded-2xl max-w-[220px] w-full"
              />
            )}
            {/* Emoji-only message — big, no bubble */}
            {isJumbo ? (
              <div
                className={`px-1 leading-none ${jumboCount === 1 ? "text-5xl" : jumboCount === 2 ? "text-4xl" : "text-3xl"}`}
              >
                {message.content}
              </div>
            ) : (
              /* Text — hidden if the whole message was just the GIF URL */
              message.content && (!gif || gif.remainingText) && (
                <div
                  className={`w-full min-w-0 px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere ${
                    isMine
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white text-black rounded-bl-sm"
                  }`}
                >
                  {renderWithLinks(
                    gif ? gif.remainingText : message.content!,
                    isMine ? "text-white/90" : "text-purple-700"
                  )}
                </div>
              )
            )}
          </>
        )}

        {/* Edited indicator — always visible if edited */}
        {message.edited_at && !message.is_deleted && (
          <span className="text-[10px] text-neutral-700 px-1">· edited</span>
        )}

        {/* Timestamp — only on last message of a same-minute group */}
        {showTimestamp && (
          <span className="text-[10px] text-neutral-600 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}

// Memoized: with stable callbacks from the parent, a bubble only re-renders
// when its own props change — so typing/seen/new-message updates no longer
// repaint every (potentially image-heavy) bubble in the list.
export const MessageBubble = memo(MessageBubbleComponent);
