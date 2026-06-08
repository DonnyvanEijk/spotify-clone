"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@/hooks/useSessionContext";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import useCustomStatus from "@/hooks/useCustomStatus";
import usePlayer from "@/hooks/usePlayer";
import { PresenceBadge } from "@/components/PresenceBadge";
import EmojiPicker, { Theme } from "emoji-picker-react";
import toast from "react-hot-toast";
import {
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { MdOutlineSettings } from "react-icons/md";
import { HiArrowRightOnRectangle } from "react-icons/hi2";

type Props = {
  followerCount: number;
};

export function SidebarAccount({ followerCount }: Props) {
  const { user } = useUser();
  const { supabaseClient } = useSessionContext();
  const supabase = useSupabaseClient();
  const player = usePlayer();
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [livePresence, setLivePresence] = useState("offline");
  const [statusOpen, setStatusOpen] = useState(false);
  const [emojiInput, setEmojiInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { customStatus, setCustomStatus, clearCustomStatus } = useCustomStatus();
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fetch profile data directly from the users table
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("users")
      .select("username, avatar_url, presence")
      .eq("id", user.id)
      .single()
      .then(({ data }: { data: { username?: string; avatar_url?: string; presence?: string } | null }) => {
        if (!data) return;
        setUsername(data.username ?? null);
        setLivePresence(data.presence ?? "offline");
        if (data.avatar_url) {
          setAvatarUrl(
            supabase.storage.from("images").getPublicUrl(data.avatar_url).data.publicUrl
          );
        }
      });
  }, [user?.id, supabase]);

  // Realtime presence subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabaseClient
      .channel(`sidebar-account-presence-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${user.id}` },
        (payload: { new: { presence?: string } }) => {
          if (payload.new.presence !== undefined) setLivePresence(payload.new.presence);
        }
      )
      .subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [user?.id, supabaseClient]);

  // Seed inputs when opening status editor
  useEffect(() => {
    if (statusOpen && customStatus) {
      const spaceIdx = customStatus.indexOf(" ");
      if (spaceIdx === -1) {
        setEmojiInput(customStatus);
        setTextInput("");
      } else {
        setEmojiInput(customStatus.slice(0, spaceIdx));
        setTextInput(customStatus.slice(spaceIdx + 1));
      }
    } else if (!statusOpen) {
      setPickerOpen(false);
    }
  }, [statusOpen]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const handleSaveStatus = async () => {
    if (!emojiInput.trim() || !user?.id) return;
    setIsSaving(true);
    try {
      const value = textInput.trim() ? `${emojiInput} ${textInput.trim()}` : emojiInput;
      setCustomStatus(value);
      await supabase
        .from("users")
        .update({ presence: `custom:${value}` } as any)
        .eq("id", user.id);
      setStatusOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearStatus = () => {
    clearCustomStatus();
    setEmojiInput("");
    setTextInput("");
    setStatusOpen(false);
    // usePresence re-evaluates via its customStatus effect and writes
    // the correct state (listening:... if a song is playing, else online)
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    player.reset();
    router.refresh();
    if (error) toast.error(error.message);
    else toast.success("Logged out");
  };

  if (!user) return null;

  const displayName = username ?? "You";

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 shrink-0 flex flex-col gap-2">
      {/* User card — clickable → profile */}
      <div className="flex items-center gap-3">
        <Link href={`/users/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-neutral-400">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate group-hover:text-neutral-200 transition-colors">
              {displayName}
            </span>
            <span className="text-xs text-neutral-500">
              {followerCount} {followerCount === 1 ? "follower" : "followers"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-0.5 shrink-0">
          <Link
            href="/account"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
            title="Account settings"
          >
            <MdOutlineSettings size={15} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Log out"
          >
            <HiArrowRightOnRectangle size={15} />
          </button>
        </div>
      </div>

      {/* Presence row */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0 overflow-visible">
          <PresenceBadge
            presence={livePresence}
            showText={true}
            truncate={true}
            onPlay={(songId) => {
              if (player.activeId === songId) {
                window.dispatchEvent(new Event("restartCurrentSong"));
              } else {
                player.insertAfterCurrent(songId);
              }
            }}
          />
        </div>
        <button
          onClick={() => setStatusOpen((v) => !v)}
          className="shrink-0 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
          title="Customize status"
        >
          <HiOutlinePencil size={13} />
        </button>
      </div>

      {/* Custom status editor */}
      {statusOpen && (
        <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Custom status</p>
          <div className="flex items-center gap-2">
            <div className="relative shrink-0" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="w-9 h-8 flex items-center justify-center text-base bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                {emojiInput || "😊"}
              </button>
              {pickerOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker
                    theme={Theme.DARK}
                    lazyLoadEmojis
                    onEmojiClick={(data) => {
                      setEmojiInput(data.emoji);
                      setPickerOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.slice(0, 40))}
              placeholder="What's your vibe?"
              maxLength={40}
              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSaveStatus}
              disabled={isSaving || !emojiInput}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-all"
            >
              <HiOutlineCheck size={11} />
              {isSaving ? "Saving…" : "Set"}
            </button>
            {customStatus && (
              <button
                onClick={handleClearStatus}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setStatusOpen(false)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <HiOutlineX size={11} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
