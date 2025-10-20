import getSongs from '@/actions/getSongs';
import { Header } from '@/components/header';
import { ListItem } from '@/components/list-item';
import Link from 'next/link';
import SongContent from './components/song-content';
import getPlaylists from '@/actions/getPlaylists';
import getPublicPlaylists from '@/actions/getPublicPlaylists';
import PlaylistContent from './components/PlaylistContent';
import getUser from '@/actions/getUser';
import AlbumContent from './components/AlbumContent';
import getAlbums from '@/actions/getAlbums';
import { getUserById, getUsersIndex } from '@/actions/getUsers';
import { getImage } from '@/lib/getImage';
import { twMerge } from 'tailwind-merge';

export const revalidate = 0;

export default async function Home() {
  const songs = await getSongs();
  const playlists = await getPlaylists();
  const publicPlaylists  = await getPublicPlaylists();
  const user = await getUser();
  const users = await getUsersIndex();
  const albums = await getAlbums();
  const currentUserData = await getUserById(user?.id as string);
  const avatarImage  = await getImage(currentUserData?.avatar_url || "");

  return (
    <div className="bg-neutral-900 min-h-screen w-full overflow-hidden">
      <Header image={avatarImage || ""}>
        <div className="mb-6">
          <h1 className="text-white text-3xl font-semibold">Welcome back</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
            <ListItem name="Liked Songs" image="/images/liked.png" href="/liked" />
          </div>
        </div>
      </Header>

      <div className="px-6 mt-4">
        <SectionHeader title="Newest Songs" link="/songs" linkText="All Songs" />
        <SongContent songs={{ songs, users }} userId={user?.id} />
      </div>

      <div className="px-6 mt-8">
        <SectionHeader title="My Playlists" />
        <PlaylistContent playlists={playlists} userId={user?.id} />
      </div>

      <div className="px-6 mt-8">
        <SectionHeader title="Public Playlists" />
        <PlaylistContent playlists={publicPlaylists} userId={user?.id} />
      </div>

      <div className="px-6 mt-8 mb-16">
        <SectionHeader title="Newest Albums" link="/album/list" linkText="All Albums" />
        <AlbumContent albums={albums} userId={user?.id} />
      </div>
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  link?: string;
  linkText?: string;
};

const SectionHeader = ({ title, link, linkText }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-white text-2xl font-semibold">{title}</h2>
      {link && linkText && (
        <Link href={link}>
          <button
            className={twMerge(`
              px-4 py-2
              bg-white/10 backdrop-blur-[15px] border border-white/20
              text-white font-semibold
              rounded-2xl
              shadow-[0_4px_30px_rgba(31,38,135,0.3)]
              transition-all duration-300
              hover:bg-white/20 hover:shadow-[0_6px_40px_rgba(128,90,213,0.4)]
              active:scale-[0.97]
            `)}
          >
            {linkText}
          </button>
        </Link>
      )}
    </div>
  );
};
