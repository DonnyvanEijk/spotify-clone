'use client';

import { HiHome } from 'react-icons/hi';
import { BiBell, BiSearch } from 'react-icons/bi';
import { usePathname } from 'next/navigation';
import { Song } from '@/types';
import { SidebarItem } from './sidebar-item';
import { Box } from './box';
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
      { icon: HiHome, label: 'Home', href: '/', active: pathname === '/' },
      { icon: BiSearch, label: 'Search', href: '/search', active: pathname === '/search' },
      { icon: BiBell, label: 'Notifications', href: '/notifications', active: pathname === '/notifications' },
    ],
    [pathname]
  );

  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col gap-y-4 w-[300px] h-full p-2">
        <Box className="bg-gradient-to-br from-neutral-800/40 to-neutral-700/20 backdrop-blur-md border border-neutral-700/40 shadow-lg shadow-purple-500/10 p-4">
          <div className="flex flex-col gap-y-4">
            {routes.map((item) => (
              <div key={item.label} className="relative">
                <SidebarItem {...item} />
                {item.label === 'Notifications' && newNotifiations > 0 && (
                  <span className="absolute top-1 right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {newNotifiations}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Box>

        <Box className="bg-gradient-to-br from-neutral-800/30 to-neutral-700/20 backdrop-blur-md border border-neutral-700/30 shadow-lg shadow-purple-500/5 overflow-y-auto h-full p-3">
          <Library songs={songs} userId={userId} />
        </Box>
      </div>

      <main className="h-full flex-1 overflow-y-auto py-2">{children}</main>
    </div>
  );
};

export default Sidebar;
