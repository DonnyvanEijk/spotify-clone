"use client"

import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type Props = {
  image: string;
  name: string;
  href: string;
  classname?: string;
};

export const ListItem = ({ image, name, href, classname }: Props) => {
  const router = useRouter();
  const onClick = () => router.push(href);

  return (
    <button
      onClick={onClick}
      className={twMerge(`
        relative group flex items-center rounded-2xl overflow-hidden gap-x-4
        bg-white/10 backdrop-blur-[15px] border border-white/20
        shadow-[0_4px_30px_rgba(31,38,135,0.3)]
        hover:bg-white/20 hover:shadow-[0_6px_40px_rgba(128,90,213,0.4)]
        transition-all duration-300
        pr-4
      `, classname)}
    >
      <div className="relative w-[64px] h-[64px] rounded-xl overflow-hidden shadow-inner shadow-white/10">
        <img
          src={image}
          alt={name}
          onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="font-medium text-white truncate py-5">{name}</p>

      <div className="
        absolute right-5 top-1/2 -translate-y-1/2
        flex items-center justify-center p-3 rounded-full
        bg-purple-500 drop-shadow-lg
        opacity-0 group-hover:opacity-100
        transition-all duration-300
        hover:scale-110
      ">
        <FaPlay className="text-black" />
      </div>

      <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:animate-shine rounded-2xl" />
    </button>
  );
};
