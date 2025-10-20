"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

const SearchControls: React.FC = () => {
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);

  const handleButtonClick = (type?: string) => {
    const url = new URL(window.location.href);
    if (type) {
      url.searchParams.set("type", type);
      setType(type);
    } else {
      url.searchParams.delete("type");
      setType(null);
    }
    router.push(url.toString());
  };

  return (
    <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg transition-all">
      {[
        { label: "Songs", value: "songs" },
        { label: "Playlists", value: "playlists" },
        { label: "Albums", value: "albums" },
      ].map((item) => (
        <Button
          key={item.value}
          onClick={() => handleButtonClick(item.value)}
          className={twMerge(
            "w-[120px] rounded-xl bg-white/20 backdrop-blur-md border border-white/10 text-white font-semibold shadow-md hover:bg-purple-500/60 hover:scale-[1.05] transition-all duration-200",
            type === item.value && "bg-purple-500/80 shadow-purple-500/40"
          )}
        >
          {item.label}
        </Button>
      ))}

      <Link href="/users">
        <Button className="w-[200px] rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-semibold backdrop-blur-md border border-purple-400/30 shadow-md hover:scale-[1.05] transition-all duration-200">
          See all users
        </Button>
      </Link>

      {type && (
        <Button
          onClick={() => handleButtonClick()}
          className="w-[120px] rounded-xl bg-transparent text-white/70 border border-white/20 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-200"
        >
          Show All
        </Button>
      )}
    </div>
  );
};

export default SearchControls;
