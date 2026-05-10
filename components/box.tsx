import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
}

export const Box = ({ children, className }: Props) => {
  return (
    <div className={twMerge(`
      rounded-2xl
      bg-linear-to-br from-neutral-800/40 to-neutral-700/20
      backdrop-blur-md
      border border-neutral-700/40
      shadow-lg shadow-black/20
      h-fit w-full
    `, className)}>
      {children}
    </div>
  )
}
