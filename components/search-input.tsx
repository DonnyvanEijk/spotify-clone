"use client";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import { Input } from "./input";

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
    <div className="w-full max-w-xl relative">
      <Input
        placeholder="What do you want to listen to?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-full px-4 py-3
          rounded-2xl
          bg-white/10
          text-white
          placeholder-white/50
          backdrop-blur-xl
          border border-white/20
          focus:border-purple-400/50
          focus:ring-2 focus:ring-purple-500/40
          outline-none
          shadow-inner
          transition-all
          duration-300
        "
      />
      {value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
          ⌕
        </span>
      )}
    </div>
  );
};
