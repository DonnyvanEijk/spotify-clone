import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ChatWindow } from "./components/ChatWindow";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function MessagesPage({ params }: Props) {
  const { userId: partnerId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  if (user.id === partnerId) redirect("/");

  const { data: partner } = await supabase
    .from("users")
    .select("id, username, avatar_url, presence")
    .eq("id", partnerId)
    .single();

  if (!partner) notFound();

  return (
    <ChatWindow
      myId={user.id}
      partner={partner}
    />
  );
}
