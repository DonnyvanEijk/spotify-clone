'use client';

import { Button } from "@/components/button";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const BillingContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url } = await postData({ url: "/api/create-portal-link" });
      window.location.assign(url);
    } catch (error) {
      toast.error((error as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-6 mb-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <h2 className="text-2xl font-bold text-white mb-4">Billing Information</h2>
      {!subscription ? (
        <div className="flex flex-col gap-4">
          <p className="text-neutral-300">No active plan.</p>
          <Button onClick={subscribeModal.onOpen} className="w-full sm:w-60">
            Subscribe
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-neutral-300">
            You are currently on the <b>{subscription?.prices?.products?.name}</b> plan.
          </p>
          <Button
            onClick={redirectToCustomerPortal}
            className="w-full sm:w-60"
            disabled={loading || isLoading}
          >
            Open Customer Portal
          </Button>
        </div>
      )}
    </div>
  );
};
