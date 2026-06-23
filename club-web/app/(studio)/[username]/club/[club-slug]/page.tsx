"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudioHeader } from "@/features/studio/components/layout/header";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useGetClubById } from "@/features/studio/hooks/use-club";
import { useModal } from "@/hooks/use-modal";
import {
  ClubBanner,
  ClubMeta,
} from "@/features/studio/components/club/detail/club-meta";
import { MembersTab } from "@/features/studio/components/club/detail/member-tab";
import { ClubDetailsTab } from "@/features/studio/components/club/detail/detail-tab";
import { SettingTab } from "@/features/studio/components/club/detail/setting-tab";

const TABS = ["General", "Members", "Settings"] as const;
type Tab = (typeof TABS)[number];

const ClubDetailPage = () => {
  const { user } = useAccountAuth();
  const router = useRouter();
  const params = useParams<{ username: string; "club-slug": string }>();
  const clubId = params["club-slug"];

  const { club, members, isLoading, query } = useGetClubById(Number(clubId));
  const {
    visible: inviteOpen,
    show: showInvite,
    close: closeInvite,
  } = useModal();

  const [activeTab, setActiveTab] = useState<Tab>("General");

  const isOwner = club?.owner === user?.username;

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-black">
        <StudioHeader />
        <div className="flex h-screen items-center justify-center text-white/40 text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (query.isError || !club) {
    return (
      <div className="relative min-h-screen bg-black">
        <StudioHeader />
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
          <p className="text-white/60">Club not found.</p>
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
    <div className="relative min-h-screen bg-black">
      <StudioHeader />

      <div className="relative flex flex-col text-white">
        <ClubBanner
          club={club}
          isOwner={isOwner}
          onEdit={() => router.push(`/${params.username}/club/${clubId}/edit`)}
        />

        <ClubMeta club={club} />

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

        {activeTab === "General" ? (
          <ClubDetailsTab club={club} />
        ) : activeTab === "Members" ? (
          <MembersTab
            members={members ?? []}
            isOwner={isOwner}
            onInvite={showInvite}
          />
        ) : (
          <SettingTab club={club} username={user.username} />
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
