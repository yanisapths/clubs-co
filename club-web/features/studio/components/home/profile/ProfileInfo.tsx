"use client";

import { Card } from "@/features/shared/components/card/Card";
import { Profile } from "@/features/studio/api/profile";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Edit3Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfileInfoProps = {
  profile?: Profile | undefined;
  clubsFounded: number;
  clubMembership?: number;
  clubsJoined: number;
  hasSetUpProfile?: boolean;
  onEditProfile: () => void;
};

export function ProfileInfo({
  profile,
  hasSetUpProfile,
  clubsFounded,
  clubMembership,
  clubsJoined,
  onEditProfile,
}: ProfileInfoProps) {
  const setUpProfileButNoClub = hasSetUpProfile && clubsFounded < 1;
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {setUpProfileButNoClub ? (
        <Card
          onClick={() =>
            router.push(`/${profile?.username}/studio/club/create`)
          }
          className="flex gap-2 px-5 py-5 items-center bg-[#2F8CFF]/12 hover:bg-[#2F8CFF]/20 border border-[#2F8CFF]/30"
        >
          <p className="whitespace-pre-line text-md font-medium leading-relaxed text-[#2F8CFF]">
            Start your own club
          </p>
          <span className="text-sm leading-relaxed text-white/60">
            Become a founder of a club and invite members to join!
          </span>
          <span className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70">
            <ChevronRight className="h-4 w-4" />
          </span>
        </Card>
      ) : null}

      <div className="flex w-full md:min-w-[550px] max-w-3xl flex-col gap-6 text-left">
        {profile?.bio && profile?.bio?.length > 0 ? (
          <Card className="px-5 py-5 bg-zinc-900">
            <p className="whitespace-pre-line text-md leading-relaxed text-white/90">
              {profile?.bio}
            </p>
          </Card>
        ) : (
          <motion.div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onEditProfile}
            animate={{
              scale: isHovering ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <Card className="bg-zinc-900 sm:min-h-24 border border-white/10 px-5 py-5 transition-colors min-h-36">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-md font-medium text-white/90">
                    Tell people about yourself
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Add a short bio so others know who you are.
                  </p>
                </div>

                <AnimatePresence>
                  {isHovering && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 8,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        x: 8,
                        scale: 0.95,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="hidden md:flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs text-blue-300 whitespace-nowrap"
                    >
                      <Edit3Icon className="h-3.5 w-3.5" />
                      Edit profile →
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isHovering && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 8,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: 8,
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="flex md:hidden items-center w-fit mt-2 gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs text-blue-300 whitespace-nowrap"
                >
                  <Edit3Icon className="h-3.5 w-3.5" />
                  Edit profile →
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <Card className="bg-zinc-900 flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Founded</p>
            <p className="text-3xl font-bold text-white">{clubsFounded}</p>
          </Card>
          {/* 
          <Card className="bg-zinc-900 flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Membership</p>
            <p className="text-3xl font-bold text-white">{clubMembership}</p>
          </Card> */}

          <Card className="bg-zinc-900 flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Joined</p>
            <p className="text-3xl font-bold text-white">{clubsJoined}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
