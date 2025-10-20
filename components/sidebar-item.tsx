import Link from "next/link";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  icon: IconType;
  label: string;
  active?: boolean;
  href: string;
}

export const SidebarItem = ({ icon: Icon, label, active, href }: Props) => {
  return (
    <Link
      href={href}
      className={twMerge(`
        flex items-center gap-x-3 p-3 rounded-xl cursor-pointer
        transition-all duration-300
        text-neutral-400 hover:text-white hover:scale-[1.02]
        ${active ? "text-purple-400 bg-neutral-700/30 shadow-sm" : ""}
      `)}
    >
      <Icon size={24} />
      <p className="truncate w-full">{label}</p>
    </Link>
  )
}
