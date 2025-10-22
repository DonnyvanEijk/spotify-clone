"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

import { Modal } from "../modal";
import { Input } from "../input";
import { Button } from "../button";
import { useCreateExistingRadioModal } from "@/hooks/useCreateExistingRadioModal";

const CreateExistingRadioModal = () => {
  const router = useRouter();
  const existingRadioModal = useCreateExistingRadioModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      genres: "",
      radio_path: "",
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      existingRadioModal.onClose();
    }
  };

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("You must be logged in to import a radio station.");
        return;
      }

      const imageFile = values.image?.[0];
      if (!imageFile || !values.name || !values.radio_path) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Upload image
      const uniqueID = uniqid();
      const sanitizedFileName = sanitizeFileName(values.name);

      const { data: imageData, error: imageError } = await supabaseClient
        .storage
        .from("images")
        .upload(`radio-${sanitizedFileName}-${uniqueID}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError || !imageData) {
        toast.error("Failed to upload image.");
        setIsLoading(false);
        return;
      }

      // Insert into radio table
      const { error: supabaseError } = await supabaseClient
        .from("radio")
        .insert({
          user_id: user.id,
          name: values.name,
          genres: values.genres,
          image_path: imageData.path,
          radio_path: values.radio_path,
        });

      if (supabaseError) {
        toast.error(`Error importing radio: ${supabaseError.message}`);
        setIsLoading(false);
        return;
      }

      toast.success("Radio imported successfully!");
      router.refresh();
      reset();
      existingRadioModal.onClose();
    } catch (error) {
      console.error("Error importing radio:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Import Existing Radio"
      description="Import a radio station into your library"
      isOpen={existingRadioModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Input
          id="name"
          disabled={isLoading}
          {...register("name", { required: true })}
          placeholder="Radio Name"
        />
        <Input
          id="genres"
          disabled={isLoading}
          {...register("genres")}
          placeholder="Genres (comma separated)"
        />
        <Input
          id="radio_path"
          disabled={isLoading}
          {...register("radio_path", { required: true })}
          placeholder="Radio Stream URL"
        />
        <div>
          <div className="pb-1">Select an image</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Import Radio
        </Button>
      </form>
    </Modal>
  );
};

export default CreateExistingRadioModal;
