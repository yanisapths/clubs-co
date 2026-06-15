"use client";
import { Button } from "@/design-system/components/button";
import { Pencil, MoreHorizontal, Plus } from "lucide-react";
import { Avatar } from "@/features/shared/components/avatar";
import { BackgroundCover } from "@/features/studio/components/layout/background-cover";
import { StudioHeader } from "@/features/studio/components/layout/header";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useRouter } from "next/navigation";

const tabs = ["Clubs", "Portfolio", "Collections"];

function ClubStudioPage() {
  const { user } = useAccountAuth();
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundCover />
      <StudioHeader />
      <div className="relative z-10 flex h-full w-full flex-col overflow-y-auto text-white">
        <div className="px-6 pb-4 pt-4 mt-40">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            size={64}
          />

          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <Button iconOnly className="bg-transparent">
              <Pencil className="h-4 w-4 text-white/60" />
            </Button>
            <Button iconOnly className="bg-transparent">
              <MoreHorizontal className="h-4 w-4 text-white/60" />
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="rounded-md border border-white/10 px-2 py-1 uppercase tracking-wide">
              Joined -
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="font-mono text-white/40"></span>

            <div className="flex items-center gap-8 text-right">
              <div>
                <p className="text-xs uppercase text-white/40">Clubs</p>
                <p className="font-semibold">0</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/40">Members</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto border-b border-white/10 px-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
                i === 0
                  ? "border-b-2 border-white text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <div className="flex -space-x-6">
            <div className="h-32 w-24 rotate-[-8deg] rounded-xl bg-sky-200" />
            <div className="h-32 w-24 rounded-xl bg-rose-300" />
            <div className="h-32 w-24 rotate-[8deg] rounded-xl bg-zinc-700" />
          </div>
          <h2 className="text-3xl font-bold">Feature your clubs</h2>
          <p className="max-w-sm text-white/50">
            Showcase clubs or collections on your profile.
          </p>

          <Button
            onClick={() => router.push(`/${user.username}/club/create`)}
            className="mt-2 rounded-full bg-white px-6 text-black hover:bg-white/90"
          >
            <Plus /> Create club
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClubStudioPage;
