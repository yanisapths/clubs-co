//  app/(studio)/[username]/club/page.tsx
"use client";
import { Button } from "@/design-system/components/button";
import { Edit3Icon, Plus } from "lucide-react";
import { StudioHeader } from "@/features/studio/components/layout/Header";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useRouter } from "next/navigation";
import { useGetOwnerClubs } from "@/features/studio/hooks/use-club";
import { BackgroundCover } from "@/features/studio/components/layout/BackgroundCover";
import { ClubCard } from "@/features/studio/components/club/ClubCard";
import { StickyFooter } from "@/features/studio/components/club/StickyFooter";
const tabs = ["Clubs"];

function ClubStudioPage() {
  const { user } = useAccountAuth();
  const router = useRouter();
  const { clubs } = useGetOwnerClubs();
  const pathToCreateClub = `/${user.username}/studio/club/create`;

  return (
    <div className="relative bg-black">
      <BackgroundCover />
      <StudioHeader />
      <div className="relative z-10 flex h-full w-full flex-col overflow-y-auto text-white">
        <div className="px-6 pb-4 pt-4 mt-40">
          <div className="flex gap-3 text-4xl items-center">
            <div className="flex items-center rounded-md bg-white/10 px-2.5 py-2.5 text-white/80 border border-white/20 backdrop-blur-sm">
              <Edit3Icon />
            </div>
            Studio
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="font-mono text-white/40"></span>

            <div className="flex items-center gap-8 text-right">
              <div>
                <p className="text-xs uppercase text-white/40">Owned Clubs</p>
                <p className="font-semibold">{clubs?.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/40">Members</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </div>
        </div>

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

        {clubs?.length > 0 ? (
          <div className="relative pb-20">
            <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onClick={() =>
                    router.push(`/${user.username}/studio/club/${club.id}`)
                  }
                />
              ))}
            </div>

            <StickyFooter pathToCreateClub={pathToCreateClub} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 mt-28 text-center">
            <div className="flex -space-x-6">
              <div className="h-32 w-24 rotate-[-8deg] rounded-xl bg-sky-200" />
              <div className="h-32 w-24 rounded-xl bg-rose-300" />
              <div className="h-32 w-24 rotate-[8deg] rounded-xl bg-zinc-700" />
            </div>
            <h2 className="text-3xl font-bold">Featured your clubs</h2>
            <p className="max-w-sm text-white/50">
              Showcase clubs or collections on your profile.
            </p>

            <Button
              onClick={() => router.push(pathToCreateClub)}
              className="mt-2 rounded-full bg-white px-6 text-black hover:bg-white/90"
            >
              <Plus /> Create club
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubStudioPage;
