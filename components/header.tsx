"use client"
import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";

type Props = {
    children: React.ReactNode;
    className?: string;
    image?: string; // kept for backwards compat with existing page usages
}

export const Header  = ({children, className}: Props) => {
    const router = useRouter();
    const { user } = useUser();
    const authModal = useAuthModal()

    return(
        <div className={twMerge("h-fit  backdrop-blur-[20px]   p-6", className)}>
           <div className="w-full mb-4 flex items-center justify-between">
            <div className="hidden md:flex gap-x-2 items-center">
                <button onClick={() => router.back()} className="rounded-full bg-white/10 backdrop-blur-md p-2 flex items-center justify-center hover:bg-white/20 transition">
                    <RxCaretLeft className="text-purple-400" size={35}/>
                </button>
                <button onClick={() => router.forward()} className="rounded-full bg-white/10 backdrop-blur-md p-2 flex items-center justify-center hover:bg-white/20 transition">
                    <RxCaretRight className="text-purple-400" size={35}/>
                </button>
            </div>
            <div className="flex md:hidden gap-x-2 items-center">
                <button onClick={() => router.push("/")} className="rounded-full p-2 bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                    <HiHome className="text-purple-400" size={20}/>
                </button>
                <button onClick={() => router.push("/search")} className="rounded-full p-2 bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                    <BiSearch className="text-purple-400" size={20}/>
                </button>
            </div>
            <div className="flex justify-between items-center gap-x-4">
                {!user && (
                    <Button className="bg-purple-600/80 text-white px-6 py-2 rounded-2xl shadow-md hover:bg-purple-600 transition" onClick={authModal.onOpen}>
                        Log in
                    </Button>
                )}
            </div>
           </div>
           {children}
        </div>
    )
}
