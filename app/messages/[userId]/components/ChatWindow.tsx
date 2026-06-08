"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useSessionContext } from "@/hooks/useSessionContext";
import usePlayer from "@/hooks/usePlayer";
import { Message, Song } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { SongSearchModal } from "./SongSearchModal";
import { PresenceBadge } from "@/components/PresenceBadge";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { processShortcodes } from "@/utils/emojiShortcodes";
import { HiArrowLeft, HiOutlinePaperAirplane, HiPlus, HiOutlineInformationCircle, HiX, HiOutlinePencil, HiReply } from "react-icons/hi";
import { HiFaceSmile } from "react-icons/hi2";
import { format, isToday, isYesterday } from "date-fns";

const MSG_SELECT = "id, conversation_id, sender_id, content, song_id, created_at, edited_at, is_deleted, reply_to_id, song:songs(id, title, author, image_path), reply_to:reply_to_id(id, sender_id, content, is_deleted)";

interface Partner {
  id: string;
  username?: string;
  avatar_url?: string;
  presence?: string;
}

interface Props {
  myId: string;
  partner: Partner;
}

async function getOrCreateConversation(
  supabase: any,
  userId1: string,
  userId2: string
): Promise<string> {
  const [user1_id, user2_id] = [userId1, userId2].sort();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user1_id", user1_id)
    .eq("user2_id", user2_id)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created } = await supabase
    .from("conversations")
    .insert({ user1_id, user2_id })
    .select("id")
    .single();
  return created!.id;
}

function dateSeparator(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

export function ChatWindow({ myId, partner }: Props) {
  const supabase = useSupabaseClient();
  const { supabaseClient } = useSessionContext();
  const player = usePlayer();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [partnerPresence, setPartnerPresence] = useState(partner.presence ?? "offline");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const realtimeChannelRef = useRef<any>(null);
  const typingBroadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const receivedTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const partnerAvatarUrl = partner.avatar_url
    ? supabase.storage.from("images").getPublicUrl(partner.avatar_url).data.publicUrl
    : null;
  const partnerName = partner.username ?? "Unknown";

  const markAsRead = useCallback(
    async (convId: string) => {
      await supabase.from("conversation_reads").upsert({
        conversation_id: convId,
        user_id: myId,
        last_read_at: new Date().toISOString(),
      });
    },
    [myId, supabase]
  );

  // Init conversation + fetch messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const convId = await getOrCreateConversation(supabase, myId, partner.id);
      if (cancelled) return;
      setConversationId(convId);

      const { data } = await supabase
        .from("messages")
        .select(MSG_SELECT)
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setMessages((data as Message[]) || []);
        setLoadingMessages(false);
        markAsRead(convId);
      }
    })();
    return () => { cancelled = true; };
  }, [myId, partner.id, supabase, markAsRead]);

  // Realtime
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabaseClient
      .channel(`chat-${conversationId}`)
      // New messages
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload: any) => {
          const { data: msg } = await supabase
            .from("messages")
            .select(MSG_SELECT)
            .eq("id", payload.new.id)
            .single();
          if (msg) {
            setMessages((prev) => [...prev, msg as Message]);
            markAsRead(conversationId);
          }
        }
      )
      // Edited / soft-deleted messages
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.new.id
                ? { ...m, content: payload.new.content, edited_at: payload.new.edited_at, is_deleted: payload.new.is_deleted }
                : m
            )
          );
        }
      )
      // Hard-deleted messages (cron cleanup)
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      // Partner presence
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${partner.id}` },
        (payload: any) => {
          if (payload.new.presence !== undefined) setPartnerPresence(payload.new.presence);
        }
      )
      // Typing broadcast
      .on("broadcast", { event: "typing" }, ({ payload }: any) => {
        if (payload.userId !== myId) {
          setPartnerTyping(payload.isTyping);
          if (payload.isTyping) {
            clearTimeout(receivedTypingTimeoutRef.current);
            receivedTypingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => {
      supabaseClient.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [conversationId, myId, partner.id, supabase, supabaseClient, markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  // Escape cancels reply/edit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReplyTo(null);
        setEditingMessage(null);
        setInput("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      realtimeChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: myId, isTyping },
      });
    },
    [myId]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    broadcastTyping(true);
    clearTimeout(typingBroadcastTimeoutRef.current);
    typingBroadcastTimeoutRef.current = setTimeout(() => broadcastTyping(false), 2000);
  };

  const sendMessage = useCallback(
    async (content?: string, songId?: string) => {
      if (!conversationId) return;
      if (!content?.trim() && !songId) return;
      setSending(true);
      broadcastTyping(false);
      clearTimeout(typingBroadcastTimeoutRef.current);

      const processed = content ? processShortcodes(content.trim()) : null;

      if (editingMessage) {
        await supabase
          .from("messages")
          .update({ content: processed, edited_at: new Date().toISOString() } as any)
          .eq("id", editingMessage.id);
        setEditingMessage(null);
      } else {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: myId,
          content: processed || null,
          song_id: songId || null,
          reply_to_id: replyTo?.id || null,
        });
        setReplyTo(null);
      }

      setInput("");
      setSending(false);
      inputRef.current?.focus();
    },
    [conversationId, myId, supabase, broadcastTyping, editingMessage, replyTo]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSongSelect = async (song: Song) => {
    setShowSongSearch(false);
    await sendMessage(undefined, song.id);
  };

  const handleReply = useCallback((msg: Message) => {
    setReplyTo(msg);
    setEditingMessage(null);
    inputRef.current?.focus();
  }, []);

  const handleEdit = useCallback((msg: Message) => {
    setEditingMessage(msg);
    setReplyTo(null);
    setInput(msg.content || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleDelete = useCallback(async (msg: Message) => {
    await supabase
      .from("messages")
      .update({ is_deleted: true } as any)
      .eq("id", msg.id);
  }, [supabase]);

  const scrollToMessage = useCallback((id: string) => {
    const el = messageRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 1500);
  }, []);

  const cancelAction = () => {
    setReplyTo(null);
    setEditingMessage(null);
    setInput("");
    inputRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    const ta = inputRef.current;
    if (!ta) { setInput((v) => v + emoji); return; }
    const start = ta.selectionStart ?? input.length;
    const end = ta.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    setShowEmojiPicker(false);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Group messages with date separators
  const grouped: Array<{ separator?: string; message?: Message }> = [];
  let lastDate = "";
  for (const msg of messages) {
    const sep = dateSeparator(msg.created_at);
    if (sep !== lastDate) {
      grouped.push({ separator: sep });
      lastDate = sep;
    }
    grouped.push({ message: msg });
  }

  const activeAction = replyTo ?? editingMessage;

  return (
    <div className={`flex flex-col overflow-hidden transition-all duration-300 ${player.activeId ? "h-[calc(100vh-8rem)]" : "h-[calc(100vh-1rem)]"}`}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <Link
          href={`/users/${partner.id}`}
          className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <HiArrowLeft size={18} />
        </Link>
        <Link href={`/users/${partner.id}`} className="flex items-center gap-3 group">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
              {partnerAvatarUrl ? (
                <img src={partnerAvatarUrl} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-neutral-400">
                  {partnerName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-neutral-950 rounded-full">
              <PresenceBadge presence={partnerPresence} showText={false} />
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white group-hover:text-neutral-200 transition-colors">
              {partnerName}
            </span>
            <PresenceBadge presence={partnerPresence} showText={true} />
          </div>
        </Link>
      </div>

      {/* Retention notice */}
      <div className="shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 bg-amber-500/10 border-b border-amber-500/20">
        <HiOutlineInformationCircle size={13} className="text-amber-400/80 shrink-0" />
        <p className="text-[11px] text-amber-400/80 font-medium">Messages older than 30 days are automatically deleted</p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-1 pb-6">
        {/* Empty state */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/10">
              {partnerAvatarUrl ? (
                <img src={partnerAvatarUrl} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-neutral-400">
                  {partnerName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-white">Say hello to {partnerName}</p>
              <p className="text-xs text-neutral-500">You haven't talked yet — be the first!</p>
            </div>
            <button
              onClick={() => sendMessage("Hello! 👋")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-sm text-white transition-all"
            >
              👋 Hello!
            </button>
          </div>
        )}

        {grouped.map((item, i) =>
          item.separator ? (
            <div key={`sep-${i}`} className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-neutral-500 shrink-0">{item.separator}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          ) : item.message ? (
            <div
              key={item.message.id}
              ref={(el) => {
                if (el) messageRefs.current.set(item.message!.id, el);
                else messageRefs.current.delete(item.message!.id);
              }}
              className={`rounded-xl transition-colors duration-700 ${highlightedId === item.message.id ? "bg-white/10" : ""}`}
            >
              <MessageBubble
                message={item.message}
                isMine={item.message.sender_id === myId}
                myId={myId}
                showAvatar={
                  i === grouped.length - 1 ||
                  grouped[i + 1]?.message?.sender_id !== item.message.sender_id
                }
                showTimestamp={(() => {
                  const fmt = (iso: string) =>
                    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const next = grouped.slice(i + 1).find((g) => g.message)?.message;
                  return !next || fmt(next.created_at) !== fmt(item.message.created_at);
                })()}
                avatarUrl={partnerAvatarUrl}
                senderName={partnerName}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onScrollToMessage={scrollToMessage}
              />
            </div>
          ) : null
        )}

        {partnerTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0">
              {partnerAvatarUrl ? (
                <img src={partnerAvatarUrl} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-neutral-400">
                  {partnerName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
        {/* Reply / edit context bar */}
        {activeAction && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            {editingMessage ? (
              <HiOutlinePencil size={13} className="text-purple-400 shrink-0" />
            ) : (
              <HiReply size={13} className="text-purple-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-purple-400 mb-0.5">
                {editingMessage ? "Editing message" : `Replying to ${replyTo?.sender_id === myId ? "yourself" : partnerName}`}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {editingMessage
                  ? editingMessage.content
                  : replyTo?.is_deleted
                    ? "Message deleted"
                    : (replyTo?.content || "🎵 Song")}
              </p>
            </div>
            <button
              onClick={cancelAction}
              className="shrink-0 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
              title="Cancel (Esc)"
            >
              <HiX size={13} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
          {/* Emoji picker */}
          <div className="relative shrink-0 self-end mb-0.5" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
              title="Emoji"
            >
              <HiFaceSmile size={18} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker
                  theme={Theme.DARK}
                  lazyLoadEmojis
                  onEmojiClick={(data) => insertEmoji(data.emoji)}
                />
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage
                ? "Edit your message…"
                : `Message ${partnerName}… (use :joy: for 😂)`
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none resize-none max-h-32 overflow-y-auto no-scrollbar leading-relaxed py-1"
            style={{ minHeight: "1.5rem" }}
          />

          {/* Song attach — hidden while editing */}
          {!editingMessage && (
            <button
              type="button"
              onClick={() => setShowSongSearch((v) => !v)}
              className="shrink-0 self-end mb-0.5 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
              title="Send a song"
            >
              <HiPlus size={18} />
            </button>
          )}

          {/* Send / Save */}
          <button
            onClick={() => sendMessage(input)}
            disabled={sending || !input.trim()}
            className="shrink-0 self-end mb-0.5 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            title={editingMessage ? "Save edit (Enter)" : "Send (Enter)"}
          >
            <HiOutlinePaperAirplane size={18} />
          </button>
        </div>
        <p className="text-[10px] text-neutral-600 mt-1.5 pl-1">
          Enter to send · Shift+Enter for new line · Esc to cancel · use :shortcode: for emojis
        </p>
      </div>

      {showSongSearch && (
        <SongSearchModal
          onSelect={handleSongSelect}
          onClose={() => setShowSongSearch(false)}
        />
      )}
    </div>
  );
}
