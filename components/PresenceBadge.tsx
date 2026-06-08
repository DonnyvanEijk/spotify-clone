import { HiMusicNote, HiPlay } from "react-icons/hi";

type Props = {
  presence?: string;
  showText?: boolean;
  className?: string;
  truncate?: boolean;
  onPlay?: (songId: string) => void;
};

type Status = "online" | "away" | "offline" | "listening" | "custom";

type Parsed = {
  status: Status;
  label: string | null;
  songId: string | null;
  songLabel: string | null;
};

function parsePresence(presence: string): Parsed {
  if (presence.startsWith("custom:") && presence.includes(";listening:")) {
    const semi = presence.indexOf(";");
    const customLabel = presence.slice(7, semi);
    const listeningPart = presence.slice(semi + 11);
    const colon = listeningPart.indexOf(":");
    return {
      status: "custom",
      label: customLabel,
      songId: colon !== -1 ? listeningPart.slice(0, colon) : null,
      songLabel: colon !== -1 ? listeningPart.slice(colon + 1) : listeningPart,
    };
  }
  if (presence.startsWith("listening:")) {
    const rest = presence.slice(10);
    const colon = rest.indexOf(":");
    return {
      status: "listening",
      label: colon !== -1 ? rest.slice(colon + 1) : rest,
      songId: colon !== -1 ? rest.slice(0, colon) : null,
      songLabel: null,
    };
  }
  if (presence.startsWith("custom:")) {
    return { status: "custom", label: presence.slice(7), songId: null, songLabel: null };
  }
  if (presence === "online" || presence === "away" || presence === "offline") {
    return { status: presence, label: null, songId: null, songLabel: null };
  }
  return { status: "offline", label: null, songId: null, songLabel: null };
}

const DOT: Record<Status, string> = {
  online: "bg-green-400",
  away: "bg-yellow-400",
  listening: "bg-green-400",
  offline: "bg-neutral-600",
  custom: "bg-green-400",
};

const STATUS_LABEL: Record<Exclude<Status, "listening" | "custom">, string> = {
  online: "Online",
  away: "Away",
  offline: "Offline",
};

export function PresenceBadge({ presence = "offline", showText = true, className = "", truncate = false, onPlay }: Props) {
  const { status, label, songId, songLabel } = parsePresence(presence);
  const pulse = status === "online" || status === "listening" || status === "custom";

  const listeningSongId = status === "listening" ? songId : null;
  const canPlayListening = !!listeningSongId && !!onPlay;
  const canPlayEmbedded = status === "custom" && !!songId && !!onPlay;

  const isListening = status === "listening" || (status === "custom" && !!songLabel);

  return (
    <div className={`flex items-center gap-1 min-w-0 overflow-visible ${className}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${DOT[status]}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${DOT[status]}`} />
      </span>
      {!showText && isListening && (
        <HiMusicNote size={9} className="text-green-400 shrink-0" />
      )}

      {showText && (
        <span className="text-xs text-neutral-400 min-w-0 overflow-visible">
          {status === "listening" && label ? (
            canPlayListening ? (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay!(listeningSongId!); }}
                className={`flex items-center gap-1 min-w-0 hover:text-green-400 transition-colors cursor-pointer group/play${truncate ? " w-full overflow-hidden" : ""}`}
              >
                <HiMusicNote size={10} className="text-green-400 shrink-0" />
                <span className="truncate">{label}</span>
                <HiPlay size={10} className="text-green-400 shrink-0 opacity-60 group-hover/play:opacity-100 transition-opacity" />
              </button>
            ) : (
              <span className={`flex items-center gap-1 min-w-0${truncate ? " w-full overflow-hidden" : ""}`}>
                <HiMusicNote size={10} className="text-green-400 shrink-0" />
                <span className="truncate">{label}</span>
              </span>
            )
          ) : status === "custom" && label ? (
            <span className={`relative group/custom items-center gap-1 min-w-0 cursor-default overflow-visible${truncate ? " flex w-full" : " inline-flex"}`}>
              <span className={truncate ? "truncate flex-1 min-w-0" : "truncate"}>{label}</span>

              {/* Always-visible music note when a song is embedded */}
              {songLabel && (
                <HiMusicNote size={10} className="text-green-400 shrink-0" />
              )}

              {/* Tooltip: pt-1 bridges the gap so hover stays alive moving into it */}
              {songLabel && (
                <span className="absolute bottom-full left-0 pb-1 hidden group-hover/custom:flex flex-col z-50">
                  <span className="flex items-center gap-1.5 bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                    <HiMusicNote size={10} className="text-green-400 shrink-0" />
                    <span className="text-xs text-white">{songLabel}</span>
                    {canPlayEmbedded && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay!(songId!); }}
                        className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer shrink-0"
                      >
                        <HiPlay size={9} className="text-black" />
                      </button>
                    )}
                  </span>
                </span>
              )}
            </span>
          ) : (
            STATUS_LABEL[status as Exclude<Status, "listening" | "custom">] ?? "Offline"
          )}
        </span>
      )}
    </div>
  );
}

export function PresenceDot({ presence }: { presence?: string }) {
  return <PresenceBadge presence={presence} showText={false} />;
}
