"use client";

import { usePresence } from "@/hooks/usePresence";

function PresenceInit() {
  usePresence();
  return null;
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresenceInit />
      {children}
    </>
  );
}
