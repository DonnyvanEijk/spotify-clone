"use client";

import { Modal } from "../modal";
import { useEffect, useState } from "react";
import { Button } from "../button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useRouter } from "next/navigation";
import { useDeleteRadioModal } from "@/hooks/useDeleteRadioModal";
import { Radio } from "@/types";

const DeleteRadioModal = () => {
  const router = useRouter();
  const deleteRadioModal = useDeleteRadioModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const [radio, setRadio] = useState<Radio | null>(null);

  const radioId = deleteRadioModal.radioId;

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
    })();

    return () => {
      cancelled = true;
    };
  }, [radioId, supabaseClient]);

  const onChange = (open: boolean) => {
    if (!open) {
      setRadio(null);
      deleteRadioModal.onClose();
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      if (!user || !radioId) {
        toast.error("You must be logged in to delete a station.");
        return;
      }

      const { error: deleteError } = await supabaseClient
        .from("radio")
        .delete()
        .eq("id", radioId)
        .eq("user_id", user.id);

      if (deleteError) {
        toast.error(`Failed to delete station: ${deleteError.message}`);
        setIsLoading(false);
        return;
      }

      if (radio?.image_path) {
        await supabaseClient.storage.from("images").remove([radio.image_path]);
      }

      toast.success("Radio station deleted");
      router.refresh();
      setRadio(null);
      deleteRadioModal.onClose();
    } catch (error) {
      console.error("Error deleting radio:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Delete Radio Station"
      description={`Are you sure you want to delete "${radio?.name ?? "this station"}"? This cannot be undone.`}
      isOpen={deleteRadioModal.isOpen}
      onChange={onChange}
    >
      <div className="flex gap-3">
        <Button
          disabled={isLoading}
          onClick={() => deleteRadioModal.onClose()}
          className="bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white rounded-lg"
        >
          Cancel
        </Button>
        <Button
          disabled={isLoading}
          onClick={handleDelete}
          className="bg-red-500/15 border border-red-500/20 text-red-300 hover:bg-red-500/25 hover:text-red-200 rounded-lg"
        >
          Delete Station
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteRadioModal;
