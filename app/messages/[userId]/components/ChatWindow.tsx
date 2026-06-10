"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useSessionContext } from "@/hooks/useSessionContext";
import usePlayer from "@/hooks/usePlayer";
import { Message, Song } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { SongSearchModal } from "./SongSearchModal";
import { GifSearchModal } from "./GifSearchModal";
import { PresenceBadge } from "@/components/PresenceBadge";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { processShortcodes } from "@/utils/emojiShortcodes";
import { fileToCompressedDataUrl } from "@/utils/imageCompress";
import { HiArrowLeft, HiOutlinePaperAirplane, HiPlus, HiOutlineInformationCircle, HiX, HiOutlinePencil, HiReply, HiMusicNote, HiPhotograph } from "react-icons/hi";
import { MdGif } from "react-icons/md";
import { playSendSound } from "@/utils/messageSounds";
import { HiFaceSmile } from "react-icons/hi2";
import { format, isToday, isYesterday } from "date-fns";

const MSG_SELECT = "id, conversation_id, sender_id, content, song_id, created_at, edited_at, is_deleted, reply_to_id, song:songs(id, title, author, image_path), reply_to:reply_to_id(id, sender_id, content, is_deleted)";

const SLASH_COMMANDS = [
  { cmd: "/gif", title: "Send a GIF", hint: "Search GIPHY", icon: <MdGif size={20} /> },
  { cmd: "/song", title: "Send a song", hint: "Search your library", icon: <HiPlus size={16} /> },
];

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
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [partnerPresence, setPartnerPresence] = useState(partner.presence ?? "offline");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [partnerLastReadAt, setPartnerLastReadAt] = useState<string | null>(null);
  const [slashHighlight, setSlashHighlight] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const dragDepthRef = useRef(0);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const realtimeChannelRef = useRef<any>(null);
  const typingBroadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const receivedTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const awayRef = useRef(false);
  const pendingReadRef = useRef(false);
  const awayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

 
  const broadcastRead = useCallback(
    (lastReadAt?: string) => {
      const at = lastReadAt ?? messagesRef.current[messagesRef.current.length - 1]?.created_at;
      if (!at) return;
      realtimeChannelRef.current?.send({
        type: "broadcast",
        event: "read",
        payload: { userId: myId, lastReadAt: at },
      });
    },
    [myId]
  );

 
  const isViewing = useCallback(
    () => typeof document !== "undefined" && document.visibilityState === "visible" && !awayRef.current,
    []
  );

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

      const { data: readRow } = await supabase
        .from("conversation_reads")
        .select("last_read_at")
        .eq("conversation_id", convId)
        .eq("user_id", partner.id)
        .maybeSingle();

      if (!cancelled) {
        setMessages((data as Message[]) || []);
        setPartnerLastReadAt(readRow?.last_read_at ?? null);
        setLoadingMessages(false);
        markAsRead(convId);
      }
    })();
    return () => { cancelled = true; };
  }, [myId, partner.id, supabase, markAsRead]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabaseClient
      .channel(`chat-${conversationId}`)
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
            if ((msg as Message).sender_id === partner.id) {
              if (isViewing()) {
                markAsRead(conversationId);
                broadcastRead((msg as Message).created_at);
              } else {
                pendingReadRef.current = true;
              }
            } else {
              markAsRead(conversationId);
            }
          }
        }
      )
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
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${partner.id}` },
        (payload: any) => {
          if (payload.new.presence !== undefined) setPartnerPresence(payload.new.presence);
        }
      )
      .on("broadcast", { event: "typing" }, ({ payload }: any) => {
        if (payload.userId !== myId) {
          setPartnerTyping(payload.isTyping);
          if (payload.isTyping) {
            clearTimeout(receivedTypingTimeoutRef.current);
            receivedTypingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
          }
        }
      })
      // Partner announced they've read up to a message — advance "Seen".
      .on("broadcast", { event: "read" }, ({ payload }: any) => {
        if (payload.userId === partner.id && payload.lastReadAt) {
          setPartnerLastReadAt((prev) =>
            !prev || new Date(payload.lastReadAt) > new Date(prev) ? payload.lastReadAt : prev
          );
        }
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          if (isViewing()) broadcastRead();
          else pendingReadRef.current = true;
        }
      });

    realtimeChannelRef.current = channel;
    return () => {
      supabaseClient.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [conversationId, myId, partner.id, supabase, supabaseClient, markAsRead, broadcastRead, isViewing]);

  useEffect(() => {
    if (!conversationId) return;
    const AWAY_MS = 5 * 60 * 1000;

    const flushPendingRead = () => {
      if (!pendingReadRef.current) return;
      pendingReadRef.current = false;
      markAsRead(conversationId);
      broadcastRead();
    };

    const goActive = () => {
      awayRef.current = false;
      clearTimeout(awayTimerRef.current);
      awayTimerRef.current = setTimeout(() => { awayRef.current = true; }, AWAY_MS);
      if (document.visibilityState === "visible") flushPendingRead();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") goActive();
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, goActive, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    awayTimerRef.current = setTimeout(() => { awayRef.current = true; }, AWAY_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, goActive));
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(awayTimerRef.current);
    };
  }, [conversationId, markAsRead, broadcastRead]);

  const didInitialScroll = useRef(false);

  useEffect(() => {
    if (loadingMessages) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: didInitialScroll.current ? "smooth" : "auto",
    });
    didInitialScroll.current = true;
  }, [messages, partnerTyping, loadingMessages]);

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

  useEffect(() => {
    if (!showAttachMenu) return;
    const handler = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAttachMenu]);

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

  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [input]);

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
    const raw = e.target.value;

    setSlashHighlight(0);

    const processed = processShortcodes(raw);
    if (processed !== raw) {
      const caret = e.target.selectionStart ?? raw.length;
      const newCaret = processShortcodes(raw.slice(0, caret)).length;
      setInput(processed);
      setTimeout(() => inputRef.current?.setSelectionRange(newCaret, newCaret), 0);
    } else {
      setInput(raw);
    }

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

      playSendSound();
      setInput("");
      setSending(false);
      inputRef.current?.focus();
    },
    [conversationId, myId, supabase, broadcastTyping, editingMessage, replyTo]
  );

  const executeSlashCommand = (cmd: string) => {
    setInput("");
    setSlashHighlight(0);
    if (cmd === "/gif") {
      setShowGifSearch(true);
      setShowSongSearch(false);
    } else if (cmd === "/song") {
      setShowSongSearch(true);
      setShowGifSearch(false);
    }
    inputRef.current?.focus();
  };

  const isSlashQuery = !editingMessage && /^\/\w*$/.test(input);
  const matchedCommands = isSlashQuery
    ? SLASH_COMMANDS.filter((c) => c.cmd.startsWith(input.toLowerCase()))
    : [];
  const showSlashMenu = matchedCommands.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashHighlight((h) => (h + 1) % matchedCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashHighlight((h) => (h - 1 + matchedCommands.length) % matchedCommands.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick = matchedCommands[slashHighlight] ?? matchedCommands[0];
        executeSlashCommand(pick.cmd);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setInput("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSongSelect = async (song: Song) => {
    setShowSongSearch(false);
    await sendMessage(undefined, song.id);
  };

  const handleGifSelect = async (url: string) => {
    setShowGifSearch(false);
    setInput(url);
    await sendMessage(url);
  };

  // Compress dropped image files and send each as an inline data-URI message.
  const sendImageFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      for (const file of images) {
        try {
          const dataUrl = await fileToCompressedDataUrl(file);
          await sendMessage(dataUrl);
        } catch {
          // Skip files that fail to load/encode.
        }
      }
    },
    [sendMessage]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingImage(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDraggingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingImage(false);
    sendImageFiles(Array.from(e.dataTransfer.files));
  };

  // Paste a copied image straight into the conversation.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = Array.from(e.clipboardData.items)
      .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
      .map((it) => it.getAsFile())
      .filter((f): f is File => !!f);
    if (imageFiles.length) {
      e.preventDefault();
      sendImageFiles(imageFiles);
    }
  };

  // "+" menu → pick image from disk.
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) sendImageFiles(files);
    e.target.value = ""; // allow re-picking the same file
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

  const lastMessage = messages[messages.length - 1];
  const seenByPartner =
    !!lastMessage &&
    lastMessage.sender_id === myId &&
    !lastMessage.is_deleted &&
    !!partnerLastReadAt &&
    new Date(lastMessage.created_at).getTime() <= new Date(partnerLastReadAt).getTime();

  return (
    <div
      className={`relative flex flex-col overflow-hidden transition-all duration-300 ${player.activeId ? "h-[calc(100vh-8rem)]" : "h-[calc(100vh-1rem)]"}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingImage && (
        <div className="absolute inset-0 z-50 m-3 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-500/60 bg-neutral-950/80 backdrop-blur-sm pointer-events-none">
          <HiPlus size={28} className="text-purple-400" />
          <p className="text-sm font-semibold text-white">Drop image to send</p>
          <p className="text-xs text-neutral-400">It'll be compressed and added to the chat</p>
        </div>
      )}
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

      <div className="shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 bg-amber-500/10 border-b border-amber-500/20">
        <HiOutlineInformationCircle size={13} className="text-amber-400/80 shrink-0" />
        <p className="text-[11px] text-amber-400/80 font-medium">Messages older than 30 days are automatically deleted</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-1 pb-6">
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

        {seenByPartner && !partnerTyping && (
          <div className="flex items-center justify-end gap-1 pr-1 pt-0.5">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-white/10 shrink-0">
              {partnerAvatarUrl ? (
                <img src={partnerAvatarUrl} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[7px] font-semibold text-neutral-400">
                  {partnerName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[10px] text-neutral-500">Seen</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
        {showSlashMenu && (
          <div className="absolute left-4 right-4 bottom-full mb-2 z-50 bg-neutral-900 border border-white/15 rounded-xl shadow-xl overflow-hidden">
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Commands
            </p>
            {matchedCommands.map((c, idx) => (
              <button
                key={c.cmd}
               
                onMouseDown={(e) => { e.preventDefault(); executeSlashCommand(c.cmd); }}
                onMouseEnter={() => setSlashHighlight(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === slashHighlight ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
                  {c.icon}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm text-white font-medium">{c.cmd}</span>
                  <span className="text-xs text-neutral-500">{c.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}

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

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              editingMessage
                ? "Edit your message…"
                : `Message ${partnerName}… (use :joy: for 😂)`
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none resize-none max-h-32 overflow-y-auto no-scrollbar leading-relaxed py-1"
            style={{ minHeight: "1.5rem" }}
          />

          {!editingMessage && (
            <>
              <button
                type="button"
                onClick={() => { setShowGifSearch((v) => !v); setShowSongSearch(false); setShowAttachMenu(false); }}
                className="shrink-0 self-end mb-0.5 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
                title="Send a GIF"
              >
                <MdGif size={22} />
              </button>

              {/* Attach popover: song or image */}
              <div className="relative shrink-0 self-end mb-0.5" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => { setShowAttachMenu((v) => !v); setShowGifSearch(false); setShowSongSearch(false); }}
                  className={`p-1.5 rounded-lg transition-all ${
                    showAttachMenu ? "text-white bg-white/10" : "text-neutral-500 hover:text-white hover:bg-white/10"
                  }`}
                  title="Attach"
                >
                  <HiPlus size={18} />
                </button>
                {showAttachMenu && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 w-40 bg-neutral-900 border border-white/15 rounded-xl shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setShowAttachMenu(false); setShowSongSearch(true); setShowGifSearch(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-200 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <HiMusicNote size={15} className="text-purple-400" /> Song
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAttachMenu(false); imageInputRef.current?.click(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-200 hover:text-white hover:bg-white/8 transition-colors"
                    >
                      <HiPhotograph size={15} className="text-purple-400" /> Image
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

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
          Enter to send · type / for commands · :shortcode: for emojis · Esc to cancel
        </p>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleImagePick}
        />
      </div>

      {showSongSearch && (
        <SongSearchModal
          onSelect={handleSongSelect}
          onClose={() => setShowSongSearch(false)}
        />
      )}
      {showGifSearch && (
        <GifSearchModal
          onSelect={handleGifSelect}
          onClose={() => setShowGifSearch(false)}
        />
      )}
    </div>
  );
}
