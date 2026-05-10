'use client';

import { HiHome } from 'react-icons/hi';
import { BiBell, BiRadio, BiSearch } from 'react-icons/bi';
import { usePathname } from 'next/navigation';
import { Song } from '@/types';
import { SidebarItem } from './sidebar-item';
import { Library } from './library';
import { useMemo } from 'react';

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
  userId: string | undefined;
  newNotifiations: number;
}

const Sidebar = ({ children, songs, userId, newNotifiations }: SidebarProps) => {
  const pathname = usePathname();

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
    <div className="flex h-full">
      <div className="hidden md:flex flex-col gap-2 w-72 h-full p-2 shrink-0">

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

        {/* Library */}
        <div className="rounded-xl bg-white/5 border border-white/10 flex-1 overflow-hidden flex flex-col">
          <Library songs={songs} userId={userId} />
        </div>

      </div>

      <main className="h-full flex-1 overflow-y-auto py-2">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
