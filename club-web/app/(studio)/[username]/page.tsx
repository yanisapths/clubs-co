//  app/(studio)/[username]/page.tsx
"use client";
import { Button } from "@/design-system/components/button";
import { Pencil, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/features/shared/components/Avatar";
import { StudioHeader } from "@/features/studio/components/layout/Header";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useState } from "react";
import { useGetOwnerClubs } from "@/features/studio/hooks/use-club";
import { Spinner } from "@heroui/react";
import { AccountSettingTab } from "@/features/studio/components/home/account-tab/AccountSettingTab";
import { ClubTab } from "@/features/studio/components/home/club-tab/ClubTab";
import { FirstStart } from "@/features/studio/components/home/FirstStart";
import { ProfileInfo } from "@/features/studio/components/home/profile/ProfileInfo";
import { BackgroundCover } from "@/features/studio/components/layout/BackgroundCover";

const TABS = ["Home", "Clubs", "Account Settings"] as const;
type Tab = (typeof TABS)[number];

function CreatorHomePage() {
  const { user } = useAccountAuth();
  const { clubs, query } = useGetOwnerClubs();
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const hasSetUpProfile = Boolean(user.displayName) && clubs?.length > 0;

  if (query.isLoading) {
    return (
      <div className="relative min-h-screen bg-black">
        <StudioHeader />
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black">
      <BackgroundCover />
      <StudioHeader />
      <div className="relative z-0 flex h-full w-full flex-col overflow-y-auto text-white">
        <div className="px-6 pt-4 mt-10">
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
        </div>

        <div className="mt-5 flex gap-6 overflow-x-auto border-b border-white/10 px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap cursor-pointer pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-white text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          {activeTab === "Home" ? (
            <div className="w-full flex justify-center">
              {hasSetUpProfile ? (
                <ProfileInfo
                  bio={user?.firstName}
                  clubsFounded={clubs?.length}
                  clubMembership={clubs?.reduce(
                    (sum, c) => sum + c.maxSeats,
                    0,
                  )}
                  clubsJoined={clubs?.filter((c) => !c.ownerId).length}
                />
              ) : (
                <FirstStart user={user} />
              )}
            </div>
          ) : activeTab === "Clubs" ? (
            <div>
              <ClubTab />
            </div>
          ) : (
            <div>
              <AccountSettingTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatorHomePage;
