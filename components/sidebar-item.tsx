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
      className={twMerge(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-sm font-medium group",
        active
          ? "bg-white/10 text-white"
          : "text-neutral-500 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={18} className={twMerge("shrink-0 transition-colors", active ? "text-white" : "text-neutral-500 group-hover:text-white")} />
      <span className="truncate">{label}</span>
    </Link>
  );
};
