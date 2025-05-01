import { getIncomingNotificationsData } from "@/actions/getIncomingNotifications";
import getSongByid from "@/actions/getSongById";
import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";

import NotificationItem from "./components/notificationItem";


const NotificationsPage = async () => {
    const currentUser = await getUser();

    if (!currentUser) {
        return <div>Error: User not found</div>;
    }

    const user = await getUserById(currentUser.id);
    const avatarImage = await getImage(user?.avatar_url || "");
    const notifications = await getIncomingNotificationsData(currentUser.id);

   
   

    return (
        <div>
            <Header image={avatarImage || ""}>
                <div className="mb-2">
                    <h1 className="text-white text-3xl font-semibold">Your notifications</h1>
                    <p>See cool new information and updates about your favorite creators here</p>
                    <p className="text-gray-400 mt-5">You have {notifications.length} notifications</p>
                </div>
            </Header>
            <div className="notifications-list">
                {notifications.length > 0 && (
                    notifications.map(async (notification, index) => {
                        const sentUser = await getUserById(notification.sent_id);
                        const sentAvatar = await getImage(sentUser?.avatar_url || "");
                        const song = notification.song_id ? await getSongByid(notification.song_id) : null;
                        const songImage = song ? await getImage(song.image_path || "") : null;
                        if (!sentUser) {
                            return null; // Skip rendering if sentUser is not found
                        }
                        
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
                    })
                ) }
            </div>
        </div>
    );
};

export default NotificationsPage;