'use client';

import { Input } from "@/components/input";
import { ListItem } from "@/components/list-item";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const InfoContent = () => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  return (
    <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-6 mb-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <h2 className="text-2xl font-bold text-white mb-4">Account Information</h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-white">Email Address</label>
          <Input
            value={user?.email || ""}
            className="text-white bg-white/10 placeholder:text-neutral-400 border border-white/20"
            readOnly
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-white">Liked Songs</label>
          <ListItem
            name="Liked Songs"
            image="/images/liked.png"
            href="/liked"
            classname="w-full sm:w-60"
          />
        </div>
      </div>
    </div>
  );
};
