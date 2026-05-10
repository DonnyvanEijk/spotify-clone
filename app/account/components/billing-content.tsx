'use client';

import { Button } from "@/components/button";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineCreditCard } from "react-icons/hi";

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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <HiOutlineCreditCard size={18} className="text-neutral-300" />
        </div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Billing</h2>
      </div>

      {!subscription ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-400">You are on the free plan.</p>
          <Button onClick={subscribeModal.onOpen} className="w-fit">
            Upgrade plan
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-sm text-neutral-300">
              Active — <span className="text-white font-medium">{subscription?.prices?.products?.name}</span>
            </p>
          </div>
          <Button onClick={redirectToCustomerPortal} className="w-fit" disabled={loading || isLoading}>
            Manage subscription
          </Button>
        </div>
      )}
    </div>
  );
};
