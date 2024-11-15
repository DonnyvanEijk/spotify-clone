"use client"
import { useUploadModal } from "@/hooks/useUploadModal"
import { Modal } from "./modal"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import uniqid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";



export const UploadModal = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const uploadModal = useUploadModal();
    const {user} = useUser();
    const supabaseClient = useSupabaseClient()
    const {register, handleSubmit, reset} = useForm<FieldValues>({
        defaultValues: {
            author: "",
            title: "",
            song: null,
            image: null
        }
    })
    const onChange  = (open:boolean) => {
        if(open) {
            reset()
            uploadModal.onClose()
        }
    }

    const onSubmit:SubmitHandler<FieldValues>  = async (values:any) => {
        try {
            setIsLoading(true)

            const imageFile = values.image?.[0]
            const audioFile = values.song?.[0]

            if(!imageFile || !audioFile || !user) {
                toast.error("Please fill all the fields")
                return
            }

            const uniqueId = uniqid()

            const {data: songData, error: songError} = await supabaseClient
            .storage
            .from('songs')
            .upload(`song-${values.title}-${uniqueId}`, audioFile, {
                cacheControl: '3600',
                upsert: false   
            })

            if(songError) {
                setIsLoading(false)
                return toast.error("Failed song upload.")
            }



            const {data: imageData, error: imageError} = await supabaseClient
            .storage
            .from('images')
            .upload(`image-${values.title}-${uniqueId}`, imageFile, {
                cacheControl: '3600',
                upsert: false   
            })


            if(imageError) {
                setIsLoading(false)
                return toast.error("Failed image upload.")
            }

            const {
                error: supabaseError
            } = await supabaseClient
            .from('songs')
            .insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imageData.path,
                song_path: songData.path
            });

            if(supabaseError) {
                setIsLoading(false)
                return toast.error(supabaseError.message)
            }

            router.refresh();
            setIsLoading(false)
            toast.success("Song uploaded successfully")
            reset();
            uploadModal.onClose()

            
        }
        catch(e) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
        
    }


    return(
        <Modal title="Add a song" description="Upload a audio file" isOpen={uploadModal.isOpen} onChange={onChange}>
           <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input id="title" disabled={isLoading}
                {...register('title', {required: true})} placeholder="Song title"/>

                <Input id="author" disabled={isLoading}
                {...register('author', {required: true})} placeholder="Song author"/>
                <div>
                    <div className="pb-1">
                        Select a song file
                    </div>
                    <Input id="song" type="file" disabled={isLoading}
                    {...register('song', {required: true})} accept=".mp3, .wav, .ogg"/>
                </div>
                <div>
                    <div className="pb-1">
                        Select a image
                    </div>
                    <Input id="image" type="file" disabled={isLoading}
                    {...register('image', {required: true})} accept="image/*"/>
                </div>
                <Button disabled={isLoading} type="submit">
                    Create
                </Button>
           </form>
        </Modal>
    )
}