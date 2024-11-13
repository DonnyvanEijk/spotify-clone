import type { Metadata } from "next";
import { Figtree } from "next/font/google"
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { UserProvider } from "@/providers/UserProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { ToasterProvider } from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUser";

const figtree = Figtree({subsets: ["latin"]});


export const metadata: Metadata = {
  title: "Spotify clone",
  description: "Generated by create next app",
};

export const revalidate = 0

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSongs = await getSongsByUserId();
  return (
    <html lang="en">
      <body
        className={figtree.className}
      >
        <ToasterProvider/>
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider/>
              <Sidebar songs={userSongs}>
                {children}
              </Sidebar>
          </UserProvider>
        </SupabaseProvider>
       
      </body>
    </html>
  );
}
