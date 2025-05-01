'use client';

import { HiHome } from 'react-icons/hi';
import { BiBell, BiSearch } from 'react-icons/bi';
import { twMerge } from 'tailwind-merge';
import { usePathname } from 'next/navigation';

import { Song } from '@/types';

import {SidebarItem} from './sidebar-item';
import {Box }from './box';
import {Library} from './library';
import { useMemo } from 'react';
import usePlayer from '@/hooks/usePlayer';

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
  userId : string | undefined
  newNotifiations: number;
}

const Sidebar = ({ children, songs, userId, newNotifiations }: SidebarProps) => {
  const pathname = usePathname();
  const player = usePlayer();

  const routes = useMemo(
    () => [
      {
        icon: HiHome,
        label: 'Home',
        active: pathname !== '/search',
        href: '/',
      },
      {
        icon: BiSearch,
        label: 'Search',
        href: '/search',
        active: pathname === '/search',
      },
      {
        icon: BiBell,
        label: 'Notifications',
        href: '/notifications',
        active: pathname === '/notifications',
      },
    ],
    [pathname]
  );

  return (
    <div
      className={twMerge(
        `
        flex 
        h-full
        `, player.activeId &&  "h-calc(100%-80px)"
      
      )}
    >
      <div
        className='
          hidden 
          md:flex 
          flex-col 
          gap-y-2 
          bg-black 
          h-full 
          w-[300px] 
          p-2
        '
      >
        <Box>
          <div className='flex flex-col gap-y-4 px-5 py-4'>
            {routes.map((item) => (
              <div key={item.label} className="relative">
          <SidebarItem {...item} />
          {item.label === 'Notifications' && newNotifiations > 0 && (
            <span className="absolute top-2 right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {newNotifiations}
            </span>
          )}
              </div>
            ))}
          </div>
        </Box>
        <Box className='overflow-y-auto h-full'>
          <Library songs={songs} userId={userId}/>
        </Box>
      </div>
      <main className='h-full flex-1 overflow-y-auto py-2'>{children}</main>
    </div>
  );
};

export default Sidebar;