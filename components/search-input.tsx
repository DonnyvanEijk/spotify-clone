"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import { Input } from "./input";
import { BiSearch } from "react-icons/bi";

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState<string>("");
  const debouncedValue = useDebounce<string>(value, 500);

  useEffect(() => {
    const query = { title: debouncedValue };
    const url = qs.stringifyUrl({ url: "/search", query });
    router.push(url);
  }, [debouncedValue, router]);

  return (
    <div className="w-full relative">
      <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
      <Input
        placeholder="Search songs, playlists, albums..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-full pl-9 pr-4 py-2.5
          rounded-xl
          bg-white/10
          text-white
          placeholder-neutral-400
          border border-white/10
          focus:border-white/30
          focus:ring-0
          outline-none
          transition-all
          duration-200
        "
      />
    </div>
  );
};
