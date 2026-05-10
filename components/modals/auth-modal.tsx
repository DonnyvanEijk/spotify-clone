"use client";
import { useSessionContext } from "@/hooks/useSessionContext";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import React, { useEffect } from "react";

import {Modal} from "../modal";
import {useAuthModal} from "@/hooks/useAuthModal";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  return (
    <Modal title="Welcome back" description="Login to your account" isOpen={isOpen} onChange={onChange}>
      <Auth
        theme="dark"
        providers={["github", "discord"]}
        magicLink
        supabaseClient={supabaseClient}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#262626",
                brandAccent: "#ffffff",
                brandButtonText: "#000000",
                inputBackground: "rgba(255,255,255,0.05)",
                inputBorder: "rgba(255,255,255,0.1)",
                inputBorderFocus: "rgba(255,255,255,0.25)",
                inputText: "#ffffff",
                inputPlaceholder: "#737373",
              },
              radii: {
                borderRadiusButton: "8px",
                buttonBorderRadius: "8px",
                inputBorderRadius: "8px",
              },
            },
          },
        }}
      />
    </Modal>
    
  );
};

export default AuthModal;