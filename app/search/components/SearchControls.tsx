"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Button} from '@/components/button';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

const SearchControls: React.FC = () => {
    const router = useRouter();
    const [type, setType] = useState<string | null>(null);

    const handleButtonClick = (type?: string) => {
        const url = new URL(window.location.href);
        if (type) {
            url.searchParams.set('type', type);
            setType(type);
        } else {
            url.searchParams.delete('type');
            setType(null);
        }
        router.push(url.toString());
    };

    return (
        <div className='flex gap-x-2'>
            <Button onClick={() => handleButtonClick('songs')} className={twMerge(
                'w-[120px] bg-white',
                type === 'songs' && 'bg-purple-500'
            )}>
                Songs
            </Button>
            <Button onClick={() => handleButtonClick('playlists')} className={twMerge(
                'w-[120px] bg-white',
                type === 'playlists' && 'bg-purple-500'
            )}>
                Playlists
            </Button>
            <Button onClick={() => handleButtonClick('albums')} className={twMerge(
                'w-[120px] bg-white',
                type === 'albums' && 'bg-purple-500'
            )}>
                Albums
            </Button>
            <Link href="/users">
                <Button className=
                    'w-[220px] bg-purple-500'
                
                >
                    See all users
                </Button>
            </Link>
            
            {type && <Button onClick={() => handleButtonClick()} className='w-[120px] bg-transparent text-white'>Show All</Button>}
        </div>
    );
};

export default SearchControls;