"use client"
import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useUser } from "@/hooks/useUser";
import { FaUserAlt } from "react-icons/fa";
import MissingLyricsMenuItem from "./MissingLyricsMenuItem";
import { MdOutlineSettings } from "react-icons/md";
import { HiOutlineUser, HiArrowRightOnRectangle } from "react-icons/hi2";
import toast from "react-hot-toast";
import usePlayer from "@/hooks/usePlayer";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Props = {
    children: React.ReactNode;
    className?: string;
    image?: string;
}

export const Header  = ({children, className, image}:Props) => {
    const player = usePlayer()
    const router = useRouter();
    const supabaseClient = useSupabaseClient()
    const { user } = useUser();
    const authModal = useAuthModal()

    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut()
        player.reset()
        router.refresh()
        if(error) toast.error(error.message)
        else toast.success("Logged out successfully")
    }

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
            <div className="flex justify-between items-center gap-x-4 ">
                {user ? (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            {image ? (
                                <img
                                    src={image}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/20 shadow-md hover:scale-105 transition-transform outline-none"
                                />
                            ) : (
                                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-purple-400 hover:bg-white/30 transition outline-none">
                                    <FaUserAlt size={16} />
                                </button>
                            )}
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="min-w-52 overflow-hidden rounded-xl p-1.5 bg-neutral-950/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50 flex flex-col z-50"
                            >
                                <DropdownMenu.Item
                                    onClick={() => router.push(`/users/${user.id}`)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                                >
                                    <HiOutlineUser size={15} /> View Profile
                                </DropdownMenu.Item>

                                <MissingLyricsMenuItem />

                                <DropdownMenu.Item
                                    onClick={() => router.push("/account")}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-white/8 hover:text-white outline-none select-none"
                                >
                                    <MdOutlineSettings size={15} /> Account Settings
                                </DropdownMenu.Item>

                                <div className="my-1 h-px bg-white/8 mx-2" />

                                <DropdownMenu.Item
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-300 cursor-pointer transition-colors duration-100 hover:bg-red-500/15 hover:text-red-300 outline-none select-none"
                                >
                                    <HiArrowRightOnRectangle size={15} /> Log out
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                ): (
                    <>
                        <Button className="bg-purple-600/80 text-white px-6 py-2 rounded-2xl shadow-md hover:bg-purple-600 transition" onClick={authModal.onOpen}>
                            Log in
                        </Button>
                    </>
                )}
            </div>
           </div>
           {children}
        </div>
    )
}
