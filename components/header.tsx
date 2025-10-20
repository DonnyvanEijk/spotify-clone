"use client"
import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useSupabaseClient  } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { FaUserAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import usePlayer from "@/hooks/usePlayer";

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
                    <div className="flex gap-x-4 items-center">
                        <Button onClick={handleLogout} className="bg-purple-600/80 text-white px-6 py-2 rounded-2xl shadow-md hover:bg-purple-600 transition">
                            Logout
                        </Button>
                        {image ? (
                            <img 
                                src={image} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/20 shadow-md hover:scale-105 transition-transform" 
                                onClick={() => router.push('/account')} 
                            />
                        ) : (
                            <Button className="bg-white/20 backdrop-blur-md text-purple-400 px-4 py-2 rounded-full shadow hover:bg-white/30 transition" onClick={() => router.push('/account')}>
                                <FaUserAlt/>
                            </Button>
                        )}
                    </div>
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
