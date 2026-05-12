"use client";

import { useState } from "react";
import Link from "next/link";
import { TbMicrophone } from "react-icons/tb";
import { HiXMark } from "react-icons/hi2";

interface LyricsAlertProps {
  count: number;
}

const LyricsAlert: React.FC<LyricsAlertProps> = ({ count }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 14);
    document.cookie = `lyrics-alert-dismissed=1; expires=${expires.toUTCString()}; path=/`;
    setDismissed(true);
  };

  if (dismissed || count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-purple-500/10 border border-purple-500/25 rounded-xl text-sm">
      <div className="flex items-center gap-2.5 text-purple-300 min-w-0">
        <TbMicrophone size={16} className="shrink-0" />
        <span className="truncate">
          <strong>{count}</strong>{" "}
          {count === 1 ? "song doesn't have" : "songs don't have"} lyrics yet.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/missing-lyrics"
          className="text-xs font-semibold text-purple-300 hover:text-white transition-colors underline underline-offset-2"
        >
          Add them now
        </Link>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="text-neutral-500 hover:text-white transition-colors"
        >
          <HiXMark size={16} />
        </button>
      </div>
    </div>
  );
};

export default LyricsAlert;
