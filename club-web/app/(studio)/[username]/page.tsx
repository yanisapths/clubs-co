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
  ProfileSaveData,
  SocialLinkMap,
} from "@/features/studio/components/home/profile/EditProfileModal";
import { SocialIcon } from "@/features/studio/components/club/detail/SocialIcons";
import { Edit3Icon } from "lucide-react";
import { Button } from "@/design-system/components/button";
import {
  useGetUserClubs,
  useGetUserProfile,
  usePatchProfile,
} from "@/features/studio/hooks/use-profile";
import { PatchProfilePayload } from "@/features/studio/api/profile";
import { formatUnixDate } from "@/lib/utils";

const TABS = ["Home", "Clubs", "Account Settings"] as const;
type Tab = (typeof TABS)[number];

function CreatorHomePage() {
  const { user } = useAccountAuth();
  const { clubs, query } = useGetOwnerClubs();
  const { profile, isLoading: isProfileLoading } = useGetUserProfile();
  const { userClubs, isLoading: isUserClubLoading } = useGetUserClubs();
  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const { show, visible, close } = useModal();
  const { mutateAsync: patchProfile } = usePatchProfile();

  const hasSetUpProfile = Boolean(user.displayName) && clubs?.length > 0;

  const socialLinksMap: SocialLinkMap =
    profile?.socialLinks?.reduce<SocialLinkMap>((acc, entry) => {
      return { ...acc, ...entry };
    }, {}) ?? {};

  const profileData: ProfileFormData = {
    firstname: profile?.firstname ?? user.firstName ?? "",
    lastname: profile?.lastname ?? user.lastName ?? "",
    displayName: profile?.displayName ?? user.displayName ?? "",
    bio: profile?.bio ?? "",
    imageUrl: profile?.imageUrl ?? null,
    bannerUrl: profile?.bannerUrl ?? null,
    socialLinks: socialLinksMap,
  };

  const activeSocialLinks = Object.entries(socialLinksMap).filter(([, url]) =>
    Boolean(url),
  );

  const usernameInitials = (user.username ?? "?").slice(0, 2).toUpperCase();

  const handleSaveProfile = async (data: ProfileSaveData) => {
    const socialLinks = Object.entries(data.socialLinks)
      .filter(([, url]) => Boolean(url))
      .map(([key, url]) => ({ [key]: url }));

    const payload: PatchProfilePayload = {
      ...(data.firstname && { firstname: data.firstname }),
      ...(data.lastname && { lastname: data.lastname }),
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.bio && { bio: data.bio }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...socialLinks,
    };

    await patchProfile(payload);
  };

  if (query.isLoading || isProfileLoading || isUserClubLoading) {
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
        <div className="relative px-6 pt-4 mt-10 pb-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Avatar
              userId={user.id}
              imageUrl={profile?.imageUrl}
              initials={usernameInitials}
              size={72}
            />
            <div className="flex flex-col gap-0.5 mb-0.5">
              <h1 className="text-xl font-bold text-white leading-tight">
                {profile?.displayName ? profile.displayName : "-"}
              </h1>

              <p
                className={
                  user.username
                    ? "text-sm text-white/60"
                    : "text-2xl font-bold text-white"
                }
              >
                @{user.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {profile?.joinedAt && (
              <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/60 uppercase tracking-wide">
                Joined at {formatUnixDate(profile.joinedAt)}
              </span>
            )}

            {activeSocialLinks.length > 0 && (
              <>
                <div className="h-6 w-px bg-white/30" />
                <div className="flex items-center gap-3.5">
                  {activeSocialLinks.map(([platform, url]) => (
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

        <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
          {activeTab === "Home" ? (
            <div className="w-full flex justify-center mt-24">
              {!hasSetUpProfile ? (
                <ProfileInfo
                  profile={profile}
                  hasSetUpProfile={hasSetUpProfile}
                  clubsFounded={userClubs?.stats.clubFounded || 0}
                  clubMembership={userClubs?.stats.clubMembership || 0}
                  clubsJoined={userClubs?.stats.clubJoined || 0}
                  onEditProfile={show}
                />
              ) : (
                <FirstStart
                  user={user}
                  onSave={handleSaveProfile}
                  profileData={profileData}
                />
              )}
            </div>
          ) : activeTab === "Clubs" ? (
            <ClubTab clubs={userClubs?.clubs} username={user.username} />
          ) : (
            <AccountSettingTab />
          )}
        </div>
      </div>

      {visible && (
        <EditProfileModal
          initialData={profileData}
          username={user?.username}
          onSave={handleSaveProfile}
          onClose={close}
        />
      )}
    </div>
  );
}

export default CreatorHomePage;
