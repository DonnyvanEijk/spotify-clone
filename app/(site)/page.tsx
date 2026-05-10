import getSongs from '@/actions/getSongs';
import { Header } from '@/components/header';
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
import Greeting from './components/Greeting';

export const revalidate = 0;

export default async function Home() {
  const songs = await getSongs();
  const playlists = await getPlaylists();
  const publicPlaylists = await getPublicPlaylists();
  const user = await getUser();
  const users = await getUsersIndex();
  const albums = await getAlbums();
  const currentUserData = user?.id ? await getUserById(user.id) : null;
  const avatarImage = await getImage(currentUserData?.avatar_url || "");

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto ">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <Greeting username={currentUserData?.username} />
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-8 flex flex-col gap-10 pb-24">
        <Section title="Newest Songs" href="/songs" linkText="See all">
          <SongContent songs={{ songs, users }} userId={user?.id} />
        </Section>

        {user?.id && (
          <Section title="My Playlists">
            <PlaylistContent playlists={playlists} userId={user.id} />
          </Section>
        )}

        <Section title="Public Playlists" href="/playlist/list/public" linkText="See all">
          <PlaylistContent playlists={publicPlaylists} userId={user?.id} />
        </Section>

        <Section title="Albums" href="/album/list" linkText="See all">
          <AlbumContent albums={albums} userId={user?.id} />
        </Section>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  href?: string;
  linkText?: string;
  children: React.ReactNode;
};

const Section = ({ title, href, linkText, children }: SectionProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-white text-xl font-bold">{title}</h2>
      {href && linkText && (
        <Link href={href} className="text-xs font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-wider">
          {linkText} →
        </Link>
      )}
    </div>
    {children}
  </div>
);
