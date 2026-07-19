"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@heroui/react";

import { Avatar } from "@/features/shared/components/Avatar";
import { BackgroundCover } from "@/features/studio/components/layout/BackgroundCover";
import { ClubTab } from "@/features/studio/components/home/club-tab/ClubTab";
import { MemberProfileInfo } from "@/features/membership/components/profile/MemberProfileInfo";
import { SocialIcon } from "@/features/studio/components/club/detail/SocialIcons";
import { formatUnixDate } from "@/lib/utils";
import {
  useGetPublicProfile,
  useGetPublicUserClubs,
} from "@/features/membership/components/profile/use-profile";
import { SocialLinkMap } from "@/features/studio/components/home/profile/EditProfileModal";
import { useAccountAuth } from "@/hooks/use-account-auth";

const TABS = ["Home", "Clubs"] as const;
type Tab = (typeof TABS)[number];

function MemberProfilePage() {
  const { user } = useAccountAuth();
  const params = useParams<{ username: string }>();
  const username = params.username;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Home");

  const { profile, isLoading: isProfileLoading } =
    useGetPublicProfile(username);

  const { userClubs, isLoading: isClubsLoading } =
    useGetPublicUserClubs(username);

  const isLoading = isProfileLoading || isClubsLoading;

  const socialLinksMap: SocialLinkMap =
    profile?.socialLinks?.reduce<SocialLinkMap>((acc, entry) => {
      return { ...acc, ...entry };
    }, {}) ?? {};
  const activeSocialLinks = Object.entries(socialLinksMap).filter(([, url]) =>
    Boolean(url),
  );

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="flex h-screen items-center justify-center text-white/40 text-sm">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!isLoading && !profile) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
          <p className="text-white/60">Member not found.</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-white/40 underline hover:text-white/70"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen h-0 bg-black">
      <BackgroundCover />
      <div className="relative h-full flex flex-col text-white">
        <div className="px-6 pb-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Avatar
              imageUrl={profile?.imageUrl}
              displayName={(profile?.displayName || profile?.username) ?? ""}
              size={72}
            />
            <div className="flex flex-col gap-0.5 mb-0.5">
              <h1 className="text-xl font-bold text-white leading-tight">
                {profile?.displayName ? profile.displayName : "-"}
              </h1>
              <p className="text-sm text-white/60">@{username}</p>
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
        </div>

        {/* Tabs */}
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

        {/* Tab content */}
        <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
          {activeTab === "Home" ? (
            <div className="w-full flex justify-center mt-20 mb-12 sm:mb-0">
              <MemberProfileInfo
                profile={profile}
                clubsFounded={userClubs?.stats.clubFounded || 0}
                clubMembership={userClubs?.stats.clubMembership || 0}
                clubsJoined={userClubs?.stats.clubJoined || 0}
              />
            </div>
          ) : (
            <ClubTab
              clubs={userClubs?.clubs}
              username={username}
              isMe={user.id == profile?.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberProfilePage;
