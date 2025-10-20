import { getIncomingNotificationsData } from "@/actions/getIncomingNotifications";
import getSongByid from "@/actions/getSongsByidServer";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";
import NotificationItem from "./components/notificationItem";


const NotificationsPage = async () => {
  const currentUser = await getUser();
  if (!currentUser) return <div>Error: User not found</div>;

  const user = await getUserById(currentUser.id);
  const avatarImage = await getImage(user?.avatar_url || "");
  const notifications = await getIncomingNotificationsData(currentUser.id);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <h1 className="text-white text-3xl font-semibold mb-2">
            Your Notifications
          </h1>
          <p className="text-neutral-400 mb-2">
            See cool new updates about your favorite creators here
          </p>
          <p className="text-gray-400 font-semibold">
            You have {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
          </p>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-6 flex flex-col gap-4">
        {notifications.length > 0
          ? await Promise.all(notifications.map(async (notification, index) => {
              const sentUser = await getUserById(notification.sent_id);
              const sentAvatar = await getImage(sentUser?.avatar_url || "");
              const song = notification.song_id ? await getSongByid(notification.song_id) : null;
              const songImage = song ? await getImage(song.image_path || "") : null;
              if (!sentUser) return null;

              return (
                <NotificationItem
                  key={index}
                  notification={notification}
                  sentUser={sentUser}
                  song={song}
                  sentAvatar={sentAvatar}
                  songImage={songImage}
                />
              );
            }))
          : <p className="text-gray-400">No notifications yet.</p>}
      </div>

      <div className="mb-[10vh]" />
    </div>
  );
};

export default NotificationsPage;
