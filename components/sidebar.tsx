'use client';

import { HiHome, HiOutlineUsers } from 'react-icons/hi';
import { BiBell, BiRadio, BiSearch } from 'react-icons/bi';
import { usePathname } from 'next/navigation';
import { Song } from '@/types';
import { SidebarItem } from './sidebar-item';
import { Library } from './library';
import { SidebarFriends } from './sidebar/SidebarFriends';
import { SidebarAccount } from './sidebar/SidebarAccount';
import { useMemo, useState } from 'react';

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
  userId: string | undefined;
  newNotifiations: number;
  followerCount: number;
}

const Sidebar = ({
  children,
  songs,
  userId,
  newNotifiations,
  followerCount,
}: SidebarProps) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');

  const routes = useMemo(
    () => [
      { icon: HiHome,    label: 'Home',          href: '/',             active: pathname === '/' },
      { icon: BiSearch,  label: 'Search',         href: '/search',       active: pathname === '/search' },
      { icon: BiRadio,   label: 'Radio',          href: '/radio',        active: pathname === '/radio' },
      ...(userId ? [{ icon: BiBell, label: 'Notifications', href: '/notifications', active: pathname === '/notifications' }] : []),
    ],
    [pathname, userId]
  );

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex flex-col gap-2 w-72 h-screen p-2 shrink-0">

        {/* Nav */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-2 shrink-0">
          <div className="flex flex-col gap-0.5">
            {routes.map((item) => (
              <div key={item.label} className="relative">
                <SidebarItem {...item} />
                {item.label === 'Notifications' && newNotifiations > 0 && (
                  <span className="absolute top-2 right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {newNotifiations > 9 ? '9+' : newNotifiations}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Library / Friends tabs */}
        <div className="rounded-xl bg-white/5 border border-white/10 flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex border-b border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === 'library'
                  ? 'text-white border-b-2 border-white -mb-px'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Your Library
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-white border-b-2 border-white -mb-px'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <HiOutlineUsers size={13} />
              Friends
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {activeTab === 'library' ? (
              <Library songs={songs} userId={userId} />
            ) : (
              <SidebarFriends />
            )}
          </div>
        </div>

        {/* Account section */}
        <SidebarAccount followerCount={followerCount} />

      </div>

      <main className="h-screen flex-1 overflow-y-auto py-2">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
