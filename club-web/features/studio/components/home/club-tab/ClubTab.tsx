import { formatUnixDate, toClubSlug } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ProfileClubItem } from "@/features/studio/api/profile";
import { Button } from "@/design-system/components/button";
import { Plus } from "lucide-react";
import { ClubThumbnail } from "../../club/ClubThumbnail";
import { getCategory } from "../../club/constants";

interface ClubTabProps {
  clubs?: ProfileClubItem[];
  username: string;
  isMe?: boolean;
}

const ROW_GRID_COLS =
  "md:grid-cols-[1fr_120px_160px_40px] lg:grid-cols-[1fr_160px_180px_48px]";

export const ClubTab = ({ clubs, username, isMe = false }: ClubTabProps) => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const pathToCreateClub = `/${username}/studio/club/create`;

  const displayedClubs = clubs?.slice(0, 6);

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
    <div className="mt-6 sm:mt-10 w-full">
      {/* Desktop/tablet header row */}
      <div
        className={`hidden md:grid ${ROW_GRID_COLS} items-center border-b border-white/10 pb-2 px-4 text-sm md:text-md uppercase tracking-wider text-white/40`}
      >
        <span className="text-left">Clubs</span>
        <span className="text-right">Type</span>
        <span className="text-right">Member Since</span>
        <span />
      </div>

      {/* Mobile-only lightweight header */}
      <div className="md:hidden flex items-center justify-between border-b border-white/10 pb-2 px-3 text-xs uppercase tracking-wider text-white/40">
        <span>Clubs</span>
        {displayedClubs && displayedClubs.length > 0 && (
          <span>{displayedClubs.length}</span>
        )}
      </div>

      <div className="max-h-[460px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {displayedClubs && displayedClubs?.length > 0 ? (
          <motion.ul
            className="divide-y divide-white/5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayedClubs?.map((club) => {
              const isHovering = hoveredId === club.id;
              const category = getCategory(club.category);
              const memberSince = club.memberSince
                ? formatUnixDate(club.memberSince)
                : "—";

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
                    onClick={() =>
                      router.push(`/club/${toClubSlug(club.name)}`)
                    }
                    className={`flex flex-col gap-2.5 md:grid ${ROW_GRID_COLS} cursor-pointer border-b border-b-white/10 items-start md:items-center py-4 sm:py-5 md:py-6 px-3 sm:px-4 rounded-lg transition-all duration-200`}
                  >
                    {/* Thumbnail + name — always shown, full width on mobile */}
                    <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
                      <motion.div
                        animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5"
                      >
                        <ClubThumbnail
                          imageUrl={club.imageUrl}
                          name={club.name}
                          category={club.category}
                          colorVariant={category?.colorVariant}
                          size="square"
                          className="h-full w-full"
                        />
                      </motion.div>
                      <div className="flex flex-col items-start gap-1 min-w-0">
                        <span className="text-base sm:text-lg font-medium text-white truncate max-w-full">
                          {club.name}
                        </span>
                        {isHovering && (
                          <motion.span
                            variants={tagVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="hidden sm:inline-flex text-xs font-semibold px-2 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded w-fit"
                          >
                            Go to club →
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Mobile: role + member-since inline under the name */}
                    <div className="flex items-center gap-4 pl-[52px] sm:pl-16 md:hidden">
                      <span className="text-sm text-white/60">{club.role}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-sm text-white/40">
                        {memberSince}
                      </span>
                    </div>

                    {/* Desktop/tablet: role column */}
                    <div className="hidden md:flex justify-end">
                      <span className="text-lg text-white/60">{club.role}</span>
                    </div>

                    {/* Desktop/tablet: member-since column */}
                    <div className="hidden md:flex justify-end">
                      <span className="text-lg text-white/40">
                        {memberSince}
                      </span>
                    </div>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : !isMe ? (
          <div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 sm:px-6 py-12 sm:py-20 mt-10 sm:mt-28 text-center">
              <p className="text-sm text-white/40">
                This member hasn&apos;t joined any club yet.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 sm:px-6 py-12 sm:py-20 mt-10 sm:mt-28 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold">
                You have no club yet.
              </h2>
              <p className="max-w-sm text-sm sm:text-base text-white/50">
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
