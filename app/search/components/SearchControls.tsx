"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: null },
  { label: "Songs", value: "songs" },
  { label: "Playlists", value: "playlists" },
  { label: "Albums", value: "albums" },
];

const SearchControls: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");
  const title = searchParams.get("title") || "";

  const handleFilter = (value: string | null) => {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (value) params.set("type", value);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          onClick={() => handleFilter(f.value)}
          className={twMerge(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
            (f.value === activeType || (f.value === null && !activeType))
              ? "bg-white text-black border-white"
              : "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/20"
          )}
        >
          {f.label}
        </button>
      ))}

      <Link href="/users">
        <button className="ml-auto px-4 py-1.5 rounded-full text-sm font-medium border bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-200">
          Browse Users
        </button>
      </Link>
    </div>
  );
};

export default SearchControls;
