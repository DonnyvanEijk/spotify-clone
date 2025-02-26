import type { Metadata } from "next";
import { Figtree } from "next/font/google"
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { UserProvider } from "@/providers/UserProvider";
import { ModalProvider } from "@/providers/ModalProvider";
import { ToasterProvider } from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUser";
import Player from "@/components/player";
import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices";
import getUser from "@/actions/getUser";

const figtree = Figtree({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "DonBeat",
  description: "Music platform by Donny",
};

export const revalidate = 0

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSongs = await getSongsByUserId();
  const products = await getActiveProductsWithPrices();
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
      </head>
      <body suppressHydrationWarning
        className={figtree.className}
      >
        <ToasterProvider/>
        <SupabaseProvider>
          <UserProvider> 
            <ModalProvider products={products}/>
              <Sidebar songs={userSongs} userId={user?.id}>
                {children}
              </Sidebar>
              <Player/>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
