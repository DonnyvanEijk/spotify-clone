"use client"
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

type Props  ={
    songId: string;
    creatorId: string;
}


export const LikeButton = ({ songId, creatorId }:Props) => {
    const { supabaseClient} = useSessionContext();
    const  router = useRouter()
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
                toast.success("Unliked!")
                router.refresh();
            }
        } else {

            const { data: existingNotification, error: fetchError } = await supabaseClient
                    .from("notifications")
                    .select("*")
                    .eq("target_id", creatorId)
                    .eq("sent_id", user.id)
                    .eq("message", `You got a new like from:`)
                    .maybeSingle();

                if (fetchError) {
                    console.error("Error checking existing notification:", fetchError.message);
                    return;
                }

                if (!existingNotification && creatorId !== user.id) {
                    console.log(creatorId, user.id)
                    const { error: notificationError } = await supabaseClient
                        .from("notifications")
                        .insert({ 
                            target_id: creatorId, 
                            sent_id: user.id, 
                            song_id: songId,
                            message: `You got a new like from:`, 
                        });

                    if (notificationError) {
                        console.error("Error creating notification:", notificationError.message);
                        return;
                    }
                }
            
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
                router.refresh();
            }
        }
    }
return(
<button onClick={handleLike} className="hover:opacity-75 transition">
    <Icon color={isLiked ? "#8F00FF" : "white"} size={25}/>
</button>
)
}