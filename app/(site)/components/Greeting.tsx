"use client";

import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { BiRadio } from "react-icons/bi";
import { HiOutlineMusicNote, HiOutlineCollection } from "react-icons/hi";

interface GreetingProps {
  username?: string | null;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const shortcuts = [
  { label: "Liked Songs", href: "/liked", icon: AiOutlineHeart },
  { label: "Radio", href: "/radio", icon: BiRadio },
  { label: "Songs", href: "/songs", icon: HiOutlineMusicNote },
  { label: "Playlists", href: "/playlist/list/public", icon: HiOutlineCollection },
];

const Greeting: React.FC<GreetingProps> = ({ username }) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-white text-3xl font-bold">
          {username ? `${username}` : "Welcome back"}
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {shortcuts.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-150 cursor-pointer group">
              <Icon size={14} className="text-neutral-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Greeting;
