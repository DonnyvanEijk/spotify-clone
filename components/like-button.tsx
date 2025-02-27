"use client"
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

type Props  ={
    songId: string;
}


export const LikeButton = ({ songId }:Props) => {
    const { supabaseClient} = useSessionContext();

    const authModal = useAuthModal();
    const {user} = useUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {

    
    const fetchData  = async () => {
        const {data, error} = await supabaseClient
        .from('liked_songs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('song_id', songId)
        .single();


        if(!error && data) {
            setIsLiked(true)
        }
    }

     fetchData()
    }, [songId, supabaseClient, user?.id])

    const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

    const handleLike = async ()  => {
        if(!user) {
            return authModal.onOpen()
        }

        if(isLiked) {
            const {error} = await supabaseClient
            .from("liked_songs")
            .delete()
            .eq("user_id", user.id)
            .eq("song_id", songId);

            if(error) {
                toast.error(error.message)
            } else {
                setIsLiked(false)
            }
        } else {
            const {error} = await supabaseClient
            .from("liked_songs")
            .insert({
                user_id: user.id,
                song_id: songId
            });

            if(error) {
                toast.error(error.message)
            } else {
                setIsLiked(true)
                toast.success("Liked!")
            }
        }
    }
return(
<button onClick={handleLike} className="hover:opacity-75 transition">
    <Icon color={isLiked ? "#8F00FF" : "white"} size={25}/>
</button>
)
}