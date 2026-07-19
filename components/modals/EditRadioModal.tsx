"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useRouter } from "next/navigation";

import { Modal } from "../modal";
import { Input } from "../input";
import { Button } from "../button";
import { useEditRadioModal } from "@/hooks/useEditRadioModal";
import { Radio } from "@/types";

const EditRadioModal = () => {
  const router = useRouter();
  const editRadioModal = useEditRadioModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const [radio, setRadio] = useState<Radio | null>(null);

  const radioId = editRadioModal.radioId;

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      genres: "",
      radio_path: "",
      image: null,
    },
  });

  useEffect(() => {
    if (!radioId) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabaseClient
        .from("radio")
        .select("*")
        .eq("id", radioId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        toast.error("Failed to fetch radio station");
        return;
      }

      setRadio(data as Radio);
      reset({
        name: data.name ?? "",
        genres: data.genres ?? "",
        radio_path: data.radio_path ?? "",
        image: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [radioId, supabaseClient, reset]);

  const currentImageUrl = useMemo(() => {
    if (!radio?.image_path) return null;
    return supabaseClient.storage.from("images").getPublicUrl(radio.image_path).data.publicUrl;
  }, [radio?.image_path, supabaseClient]);

  const selectedImage = watch("image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const file = selectedImage?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const previewSrc = previewUrl ?? currentImageUrl;

  const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      setRadio(null);
      setPreviewUrl(null);
      editRadioModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user || !radioId) {
        toast.error("You must be logged in to edit a station.");
        return;
      }
      if (!values.name || !values.radio_path) {
        toast.error("Please fill in all required fields.");
        return;
      }

      let imagePath = radio?.image_path ?? null;
      const imageFile = values.image?.[0];

      if (imageFile) {
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

        const oldImagePath = radio?.image_path;
        imagePath = imageData.path;

        if (oldImagePath && oldImagePath !== imagePath) {
          await supabaseClient.storage.from("images").remove([oldImagePath]);
        }
      }

      const { error: updateError } = await supabaseClient
        .from("radio")
        .update({
          name: values.name,
          genres: values.genres,
          radio_path: values.radio_path,
          image_path: imagePath,
        })
        .eq("id", radioId)
        .eq("user_id", user.id);

      if (updateError) {
        toast.error(`Error editing radio: ${updateError.message}`);
        setIsLoading(false);
        return;
      }

      toast.success("Radio station updated!");
      router.refresh();
      reset();
      setRadio(null);
      setPreviewUrl(null);
      editRadioModal.onClose();
    } catch (error) {
      console.error("Error editing radio:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Radio Station"
      description="Update the details of your radio station"
      isOpen={editRadioModal.isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
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
          <div className="pb-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Cover image
          </div>

          <div className="mb-3 flex items-center gap-3">
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 text-center px-1">
                  No image
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              {previewUrl
                ? "New image selected"
                : currentImageUrl
                  ? "Current cover — choose a file to replace it"
                  : "Choose a cover image for this station"}
            </p>
          </div>

          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image")}
          />
        </div>

        <Button disabled={isLoading} type="submit">
          Save Changes
        </Button>
      </form>
    </Modal>
  );
};

export default EditRadioModal;
