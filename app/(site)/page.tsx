import getSongs from '@/actions/getSongs';
import { Header } from '@/components/header';
import {ListItem } from '@/components/list-item';
import Link from 'next/link';
import SongContent from './components/song-content';
export const revalidate = 0;

export default async function Home() {
  //@ts-expect-error Songs is allowed to be null
  let songs = [];
  let errorMessage = '';


  try {
    songs = await getSongs();
  } catch (error) {
    console.error(error);
    errorMessage = 'Failed to load songs. Please try again later.';
  }

  return (
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <Header>
        <div className='mb-2'>
          <h1 className='text-white text-3xl font-semibold'>Welcome back</h1>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4'>
            <ListItem name='Liked Songs' image='/images/liked.png' href='/liked' />
          </div>
        </div>
      </Header>
      <div className='mt-2 mb-[3vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl font-semibold'>Newest songs</h1>
          <div className='mt-4'>
            <Link href="/songs">
                <button
              className='px-4 py-2 bg-green-600 text-white rounded'
            >
              All songs
            </button>
            </Link>
       
      </div>
        </div>
        {errorMessage ? (
          <div className='text-red-500'>{errorMessage}</div>
        ) : (
          // @ts-expect-error allowed to be null
          <SongContent songs={songs} />
        )}
      </div>

      <div className='mt-2 mb-[3vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl font-semibold'>My Playlists</h1>
          
        </div>
        {errorMessage ? (
          <div className='text-red-500'>{errorMessage}</div>
        ) : (
          //TODO: Add playlist content
          // <SongContent songs={songs} />
          <p className='text-neutral-400 font-semibold mt-2'>Is going to be added later!</p>
        )}
      </div>

      <div className='mt-2 mb-[10vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl font-semibold'>All Playlists</h1>
          
        </div>
        {errorMessage ? (
          <div className='text-red-500'>{errorMessage}</div>
        ) : (
          //TODO: Add playlist content
          // <SongContent songs={songs} />
          
          <p className='text-neutral-400 font-semibold mt-2'>Is going to be added later!</p>
        )}
      </div>
    </div>
  );
}

