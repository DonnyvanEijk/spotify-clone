import getSongs from '@/actions/getSongs';
import { Header } from '@/components/header';
import {ListItem } from '@/components/list-item';
import Link from 'next/link';
import SongContent from './components/song-content';
import getPlaylists from '@/actions/getPlaylists';
import getPublicPlaylists from '@/actions/getPublicPlaylists';
import PlaylistContent from './components/PlaylistContent';
import getUser from '@/actions/getUser';
import AlbumContent from './components/AlbumContent';
import getAlbums from '@/actions/getAlbums';

export const revalidate = 0;

export default async function Home() {
    const songs = await getSongs();
    const playlists = await getPlaylists();
    const publicPlaylists  = await getPublicPlaylists()
    const user = await getUser();
    const albums = await getAlbums();


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
          <h1 className='text-white text-2xl font-semibold mb-2'>Newest songs</h1>
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
      
         
          <SongContent songs={songs} userId={user?.id} />
        
      </div>

      <div className='mt-2 mb-[3vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl mb-2 font-semibold'>My Playlists</h1>
          
        </div>
      
         <PlaylistContent playlists={playlists} userId={user?.id} />
    
      </div>

      <div className='mt-2 mb-[10vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl font-semibold mb-2'>Public Playlists</h1>
          
        </div>
         <PlaylistContent playlists={publicPlaylists} userId={user?.id} />  
      </div>

      <div className='mt-2 mb-[3vh] px-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-white text-2xl font-semibold mb-2'>Newest Albums</h1>
          <div className='mt-4'>
            <Link href="/album/list">
                <button
              className='px-4 py-2 bg-green-600 text-white rounded'
            >
              All Albums
            </button>
            </Link>
       
      </div>
        </div>
      
         
          <AlbumContent albums={albums} userId={user?.id} />
          <div className='mb-[10vh]'/>
      </div>
    </div>
  );
}

