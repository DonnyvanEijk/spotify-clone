import getSongs from '@/actions/getSongs';
import { Header } from '@/components/header';
import { ListItem } from '@/components/list-item';
import PageContent from './components/page-content';
import getUser from '@/actions/getUser';
import { getUserById, getUsersIndex } from '@/actions/getUsers';
import { getImage } from '@/lib/getImage';

export const revalidate = 0;

export default async function Home() {
  const user = await getUser();
  const songs = await getSongs();
  const users = await getUsersIndex();
  const currentUser = user?.id ? await getUserById(user.id) : null;
  const avatarImage = await getImage(currentUser?.avatar_url || "");

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto ">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <h1 className="text-white text-3xl font-bold">All the songs</h1>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-8 pb-24">
        {/* Pass songs and users to the client component for filtering */}
        <PageContent 
          songs={songs || []} 
          users={users} 
          userId={user?.id} 
        />
      </div>
    </div>
  );
}