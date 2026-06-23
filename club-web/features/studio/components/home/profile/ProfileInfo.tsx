"use client";

import { Card } from "@/features/shared/components/card/Card";
import { UserInfo } from "@/hooks/use-account-auth";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileInfoProps = {
  user?: UserInfo;
  clubsFounded: number;
  clubMembership: number;
  clubsJoined: number;
};

export function ProfileInfo({
  user,
  clubsFounded,
  clubMembership,
  clubsJoined,
}: ProfileInfoProps) {
  const setUpProfileButNoClub = Boolean(user?.displayName) && clubsFounded < 1;
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      {setUpProfileButNoClub ? (
        <Card
          onClick={() => router.push(`/${user?.username}/studio/club/create`)}
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

      <div className="flex w-full max-w-3xl flex-col gap-6 text-left">
        {user?.bio ? (
          <Card className="px-5 py-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/90">
              {user?.bio}
            </p>
          </Card>
        ) : null}

        <div className="grid grid-cols-3 gap-4">
          <Card className="flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Founded</p>
            <p className="text-3xl font-bold text-white">{clubsFounded}</p>
          </Card>

          <Card className="flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Membership</p>
            <p className="text-3xl font-bold text-white">{clubMembership}</p>
          </Card>

          <Card className="flex flex-col items-center justify-center gap-1 px-4 py-6">
            <p className="text-sm text-white/60">Club Joined</p>
            <p className="text-3xl font-bold text-white">{clubsJoined}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
