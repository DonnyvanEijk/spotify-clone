"use client";

import { Button } from "@/components/button";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useCreateExistingRadioModal } from "@/hooks/useCreateExistingRadioModal";
import { useUser } from "@/hooks/useUser";

export const CreateExistingRadioButton = () => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const radioModal = useCreateExistingRadioModal()

  const handleClick = () => {
    if (!user) {
      authModal.onOpen();
      return;
    }

    radioModal.onOpen(); 
  };

  return (
    <Button
      onClick={handleClick}
      className="text-white w-full sm:w-auto px-6 py-2"
    >
      Create Existing Radio
    </Button>
  );
};
