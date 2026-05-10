import { getIncomingNotificationsData } from "@/actions/getIncomingNotifications";
import getSongByid from "@/actions/getSongsByidServer";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";
import NotificationItem from "./components/notificationItem";
import { BiBell } from "react-icons/bi";

const NotificationsPage = async () => {
  const currentUser = await getUser();
  if (!currentUser) return null;

  const user = await getUserById(currentUser.id);
  const avatarImage = await getImage(user?.avatar_url || "");
  const notifications = await getIncomingNotificationsData(currentUser.id);

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <h1 className="text-white text-3xl font-semibold">Notifications</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {notifications.length === 0
              ? "You're all caught up"
              : `${notifications.length} ${notifications.length === 1 ? "notification" : "notifications"}`}
          </p>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-6 pb-24">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500">
            <BiBell size={40} />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {await Promise.all(notifications.map(async (notification, index) => {
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
            }))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
