//  app/(studio)/[username]/page.tsx
"use client";
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
import { useModal } from "@/hooks/use-modal";
import {
  EditProfileModal,
  ProfileFormData,
} from "@/features/studio/components/home/profile/EditProfileModal";
import { SocialIcon } from "@/features/studio/components/club/detail/SocialIcons";
import { Edit3Icon } from "lucide-react";
import { Button } from "@/design-system/components/button";

const TABS = ["Home", "Clubs", "Account Settings"] as const;
type Tab = (typeof TABS)[number];

const MOCK_SOCIAL_LINKS = [
  { platform: "Instagram" as const, url: "https://instagram.com" },
  { platform: "Meta" as const, url: "https://facebook.com" },
  { platform: "X" as const, url: "https://x.com" },
];

function CreatorHomePage() {
  const { user } = useAccountAuth();
  const { clubs, query } = useGetOwnerClubs();
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const { show, visible, close } = useModal();

  const hasSetUpProfile = Boolean(user.displayName) && clubs?.length > 0;

  // Mock joined date — replace with real user.createdAt
  const joinedDate = "Joined 5 Feb 2026";

  const profileData: ProfileFormData = {
    displayName:
      user?.displayName ||
      user?.username ||
      `${user?.firstName} ${user?.lastName}`.trim(),
    bio: user?.bio || "",
    avatarUrl: null,
    socialLinks: MOCK_SOCIAL_LINKS,
  };

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
    <div className="relative min-h-screen h-0 bg-black">
      <BackgroundCover />
      <StudioHeader />

      <div className="relative z-0 flex h-full w-full flex-col overflow-y-auto text-white">
        {/* ── Banner ── */}
        <div className="relative px-6 pt-4 mt-10 pb-5 flex flex-col gap-3">
          <div className="flex items-end gap-4">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              size={72}
            />
            <div className="flex flex-col gap-0.5 mb-0.5">
              {user.displayName && (
                <h1 className="text-xl font-bold text-white leading-tight">
                  {user.displayName}
                </h1>
              )}
              <p
                className={
                  user.displayName
                    ? "text-sm text-white/60"
                    : "text-2xl font-bold text-white"
                }
              >
                {user.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/60 uppercase tracking-wide">
              {joinedDate}
            </span>

            {MOCK_SOCIAL_LINKS.length > 0 && (
              <>
                <div className="h-6 w-px bg-white/30" />
                <div className="flex items-center gap-3.5">
                  {MOCK_SOCIAL_LINKS.map(({ platform, url }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label={platform}
                    >
                      <SocialIcon platform={platform} />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            onClick={show}
            className="absolute bottom-5 right-6 rounded-full bg-white text-black px-4 py-1.5 text-sm font-medium hover:bg-white/85 transition-colors"
          >
            <Edit3Icon /> Edit profile
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto border-b border-white/10 px-6">
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

        {/* ── Tab content ── */}
        <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
          {activeTab === "Home" ? (
            <div className="w-full flex justify-center mt-24">
              {hasSetUpProfile ? (
                <ProfileInfo
                  user={user}
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
            <ClubTab />
          ) : (
            <AccountSettingTab user={user} />
          )}
        </div>
      </div>

      {visible && (
        <EditProfileModal
          initialData={profileData}
          username={user?.username}
          onSave={async (data, avatarFile) => {
            console.log("Save profile", data, avatarFile);
            close();
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

export default CreatorHomePage;
