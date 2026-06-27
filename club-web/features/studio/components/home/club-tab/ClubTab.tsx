import { formatUnixDate } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProfileClubItem } from "@/features/studio/api/profile";
import { Button } from "@/design-system/components/button";
import { Plus } from "lucide-react";

interface ClubTabProps {
  clubs?: ProfileClubItem[];
  username: string;
}

export const ClubTab = ({ clubs, username }: ClubTabProps) => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const pathToCreateClub = `/${username}/studio/club/create`;

  const displayedClubs = clubs?.slice(0, 6);

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
        {displayedClubs && displayedClubs?.length > 0 ? (
          <motion.ul
            className="divide-y divide-white/5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayedClubs?.map((club) => {
              const isHovering = hoveredId === club.id;

              return (
                <motion.li
                  key={club?.id}
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredId(club.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div
                    initial="rest"
                    animate={isHovering ? "hover" : "rest"}
                    variants={hoverVariants}
                    onClick={() => handleClubClick(club.name)}
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
        ) : (
          <div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 mt-28 text-center">
              <h2 className="text-3xl font-bold">You have no club yet.</h2>
              <p className="max-w-sm text-white/50">
                Create your own club or explore clubs and join.
              </p>

              <Button
                onClick={() => router.push(pathToCreateClub)}
                className="mt-2 rounded-full bg-white px-6 text-black hover:bg-white/90"
              >
                <Plus /> Create club
              </Button>

              <p className="text-center text-sm text-white/40">
                Not a creator?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-white/70 cursor-pointer underline-offset-2 hover:underline hover:text-white transition-colors"
                >
                  Explore clubs to join
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
