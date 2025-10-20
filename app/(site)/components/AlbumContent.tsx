"use client"

import AlbumItem from "@/components/AlbumItem";
import { Album } from "@/types";
import { motion } from "framer-motion";

interface PageContentProps {
  albums: Album[];
  userId: string | undefined;
}

const AlbumContent: React.FC<PageContentProps> = ({ albums, userId }) => {
  if (albums.length === 0) {
    return <div className="mt-4 text-neutral-400">No Albums Available</div>;
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
      {albums.slice(0, 8).map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <AlbumItem
            key={item.id}
            data={item}
            isOwner={item.user_id === userId}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AlbumContent;
