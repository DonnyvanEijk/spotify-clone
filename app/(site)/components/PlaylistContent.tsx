"use client"

import PlaylistItem from "@/components/PlaylistItem";
import { Playlist } from "@/types";
import { motion } from "framer-motion";

interface PlaylistContentProps {
  playlists: Playlist[];
  userId: string | undefined;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ playlists, userId }) => {
  if (playlists.length === 0) {
    return <div className="mt-4 text-neutral-400">No Playlists Available</div>;
  }

  return (
    <motion.div
    className="
  grid
  grid-cols-2
  sm:grid-cols-3
  md:grid-cols-3
  lg:grid-cols-4
  xl:grid-cols-5
  2xl:grid-cols-7
  gap-6 mt-4 px-2
"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {playlists.slice(0, 16).map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <PlaylistItem
            isOwner={item.user_id === userId}
            data={item}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PlaylistContent;
