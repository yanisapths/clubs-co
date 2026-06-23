"use client";

import { Card } from "@/features/shared/components/card/Card";

type ProfileInfoProps = {
  bio?: string;
  clubsFounded: number;
  clubMembership: number;
  clubsJoined: number;
};

export function ProfileInfo({
  bio,
  clubsFounded,
  clubMembership,
  clubsJoined,
}: ProfileInfoProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 text-left">
      {bio ? (
        <Card className="px-5 py-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/90">
            {bio}
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
  );
}
