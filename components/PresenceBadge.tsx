import { HiMusicNote, HiPlay } from "react-icons/hi";

type Props = {
  presence?: string;
  showText?: boolean;
  className?: string;
  onPlay?: (songId: string) => void;
};

type Status = "online" | "away" | "offline" | "listening";

function parsePresence(presence: string): { status: Status; songId: string | null; label: string | null } {
  if (presence.startsWith("listening:")) {
    // format: "listening:SONG_ID:Title by Author"
    const rest = presence.slice(10);
    const colon = rest.indexOf(":");
    if (colon !== -1) {
      return { status: "listening", songId: rest.slice(0, colon), label: rest.slice(colon + 1) };
    }
    // fallback: old format without ID
    return { status: "listening", songId: null, label: rest };
  }
  if (presence === "online" || presence === "away" || presence === "offline") {
    return { status: presence, songId: null, label: null };
  }
  return { status: "offline", songId: null, label: null };
}

const DOT = {
  online: "bg-green-400",
  away: "bg-yellow-400",
  listening: "bg-green-400",
  offline: "bg-neutral-600",
};

const LABEL: Record<Exclude<Status, "listening">, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

export function PresenceBadge({ presence = "offline", showText = true, className = "", onPlay }: Props) {
  const { status, songId, label } = parsePresence(presence);
  const pulse = status === "online" || status === "listening";
  const canPlay = status === "listening" && !!songId && !!onPlay;

  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${className}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${DOT[status]}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${DOT[status]}`} />
      </span>

      {showText && (
        <span className="text-xs text-neutral-400 truncate min-w-0">
          {status === "listening" && label ? (
            canPlay ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay!(songId!);
                }}
                className="flex items-center gap-1 min-w-0 hover:text-green-400 transition-colors cursor-pointer group/play"
              >
                <HiMusicNote size={10} className="text-green-400 shrink-0" />
                <span className="truncate">{label}</span>
                <HiPlay size={10} className="text-green-400 shrink-0 opacity-60 group-hover/play:opacity-100 transition-opacity" />
              </button>
            ) : (
              <span className="flex items-center gap-1 min-w-0">
                <HiMusicNote size={10} className="text-green-400 shrink-0" />
                <span className="truncate">{label}</span>
              </span>
            )
          ) : (
            LABEL[status as Exclude<Status, "listening">] ?? "Offline"
          )}
        </span>
      )}
    </div>
  );
}

export function PresenceDot({ presence }: { presence?: string }) {
  return <PresenceBadge presence={presence} showText={false} />;
}
