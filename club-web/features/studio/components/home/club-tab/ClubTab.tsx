import { formatUnixDate } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const clubs = [
  {
    id: 1,
    name: "Hanya Dance Crew",
    role: "Founder",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/5152595/pexels-photo-5152595.jpeg",
    slug: "hanya-dance-crew",
  },
  {
    id: 2,
    name: "Eat & Travel Guide",
    role: "Co-Founder",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/37686801/pexels-photo-37686801.jpeg",
    slug: "eat-travel-guide",
  },
  {
    id: 3,
    name: "Kathy Football Club",
    role: "Member",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/32266262/pexels-photo-32266262.jpeg",
    slug: "kathy-football-club",
  },
  {
    id: 4,
    name: "Slow Run Club",
    role: "Member",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/19146676/pexels-photo-19146676.jpeg",
    slug: "slow-run-club",
  },
  {
    id: 5,
    name: "Underground Dance Crew",
    role: "Member",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/34053878/pexels-photo-34053878.jpeg",
    slug: "underground-dance-crew",
  },
  {
    id: 6,
    name: "Vintage Bookstore",
    role: "Member",
    memberSince: 1782264460,
    imageUrl:
      "https://images.pexels.com/photos/33746724/pexels-photo-33746724.jpeg",
    slug: "vintage-bookstore",
  },
];

export const ClubTab = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const displayedClubs = clubs.slice(0, 6);

  const handleClubClick = (slug: string) => {
    router.push(`/clubs/${slug}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const hoverVariants = {
    rest: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0)" },
    hover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="mt-10">
      <div className="grid grid-cols-[1fr_880px_180px_48px] items-center border-b border-white/10 pb-2 px-4 text-md uppercase tracking-wider text-white/40">
        <span className="text-left">Clubs</span>
        <span className="text-right">Type</span>
        <span className="text-right">Member Since</span>
        <span />
      </div>

      <div className="max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <motion.ul
          className="divide-y divide-white/5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedClubs.map((club) => {
            const isHovering = hoveredId === club.id;

            return (
              <motion.li
                key={club.id}
                variants={itemVariants}
                className="relative"
                onMouseEnter={() => setHoveredId(club.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.div
                  initial="rest"
                  animate={isHovering ? "hover" : "rest"}
                  variants={hoverVariants}
                  onClick={() => handleClubClick(club.slug)}
                  className="grid grid-cols-[1fr_880px_180px_48px] cursor-pointer border-b border-b-white/10 items-center py-6 px-4 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5"
                    >
                      <Image
                        src={club.imageUrl}
                        alt={club.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </motion.div>
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-medium text-white">
                        {club.name}
                      </span>
                      {isHovering && (
                        <motion.span
                          variants={tagVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="text-xs font-semibold px-2 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded inline-flex w-fit"
                        >
                          Go to club →
                        </motion.span>
                      )}
                    </div>
                  </div>

                  <motion.div
                    transition={{ duration: 0.2 }}
                    className="flex justify-end"
                  >
                    <span className="text-lg text-white/60">{club.role}</span>
                  </motion.div>

                  <motion.div
                    transition={{ duration: 0.2 }}
                    className="flex justify-end"
                  >
                    <span className="text-lg text-white/40">
                      {club.memberSince
                        ? formatUnixDate(club.memberSince)
                        : "—"}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
};
