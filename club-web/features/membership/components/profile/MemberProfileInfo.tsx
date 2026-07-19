"use client";

import { Card } from "@/features/shared/components/card/Card";
import { Profile } from "@/features/studio/api/profile";

type MemberProfileInfoProps = {
  profile?: Profile | undefined;
  clubsFounded: number;
  clubMembership: number;
  clubsJoined: number;
};

export function MemberProfileInfo({
  profile,
  clubsFounded,
  clubMembership,
  clubsJoined,
}: MemberProfileInfoProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-full max-w-3xl flex-col gap-6 text-left">
        {profile?.bio && profile?.bio?.length > 0 ? (
          <Card className="px-5 py-5 bg-zinc-900 md:min-w-[550px]">
            <p className="whitespace-pre-line text-md leading-relaxed text-white/90">
              {profile?.bio}
            </p>
          </Card>
        ) : (
          <Card className="bg-zinc-900 min-h-24 md:min-w-[550px] border border-white/10 px-5 py-5 flex items-center justify-center">
            <p className="text-sm text-white/40">
              This member hasn&apos;t added a bio yet.
            </p>
          </Card>
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
