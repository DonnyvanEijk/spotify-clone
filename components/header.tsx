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
}

export const Header  = ({children, className}:Props) => {
    const player = usePlayer()
    const router = useRouter();
    const supabaseClient = useSupabaseClient()
    const { user } = useUser();
    const authModal = useAuthModal()
    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut()
        player.reset()
        router.refresh()

        if(error) {
            toast.error(error.message)
        } else {
            toast.success("Logged out successfully")
        }
    }
    return(
        <div className={twMerge("h-fit bg-gradient-to-b from-emerald-800 p-6", className)}>
           <div className="w-full mb-4 flex items-center justify-between">
            <div className="hidden md:flex gap-x-2 items-center">
                <button onClick={() => router.forward} className="rounded-full bg-black  flex items-center justify-center hover:opacity-75 transition">
                         <RxCaretLeft className="text-white" size={35}/>
                </button>
                <button onClick={() => router.back} className="rounded-full bg-black  flex items-center justify-center hover:opacity-75 transition">
                         <RxCaretRight className="text-white" size={35}/>
                </button>
            </div>
            <div className="flex md:hidden gap-x-2 items-center">
                <button onClick={() => router.push("/")} className="rounded-full p-2  bg-white flex  items-center justify-center hover:opacity-75 transition">
                    <HiHome className="text-black" size={20}/>
                </button>
                <button onClick={() => router.push("/search")} className="rounded-full p-2  bg-white flex  items-center justify-center hover:opacity-75 transition">
                    <BiSearch className="text-black" size={20}/>
                </button>
            </div>
            <div className="flex justify-between items-center gap-x-4 ">
                {user ? (
                    <div className="flex gap-x-4 items-center">
                        <Button onClick={handleLogout} className="bg-white px-6 PY-2">
                            Logout
                        </Button>
                        <Button className="bg-white" onClick={() => router.push('/account')}>
                            <FaUserAlt/>
                        </Button>
                    </div>
                ): (
                <>
                <div>
                    <Button className="bg-transparent text-neutral-300 font-medium"  onClick={authModal.onOpen}>
                        Sign up
                    </Button>
                </div>
                <div>
                    <Button className="bg-white px-6 py-2" onClick={authModal.onOpen}>
                        Log in
                    </Button>
                </div>
                </>
                )}
            </div>
           </div>
           {children}
        </div>
    )
}