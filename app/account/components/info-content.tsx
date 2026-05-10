'use client';

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HiOutlineUser, HiOutlineHeart } from "react-icons/hi";
import Link from "next/link";

export const InfoContent = () => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <HiOutlineUser size={18} className="text-neutral-300" />
        </div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Account</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Email</p>
          <p className="text-sm text-neutral-200 truncate">{user?.email || '—'}</p>
        </div>

        <div className="w-full h-px bg-white/10" />

        <Link
          href="/liked"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <img src="/images/liked.png" alt="Liked Songs" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-white truncate">Liked Songs</p>
            <p className="text-xs text-neutral-500">Your saved tracks</p>
          </div>
          <HiOutlineHeart size={16} className="text-neutral-500 group-hover:text-white ml-auto shrink-0 transition-colors" />
        </Link>
      </div>
    </div>
  );
};
