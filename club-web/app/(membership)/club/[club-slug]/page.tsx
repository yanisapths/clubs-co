"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MembersTab } from "@/features/studio/components/club/detail/MemberTab";
import {
  ClubBanner,
  ClubMeta,
} from "@/features/studio/components/club/detail/ClubMeta";
import { useGetMembershipClubByName } from "@/features/membership/hooks/use-club";
import { ClubDetailsTab } from "@/features/membership/components/club/DetailTab";

const TABS = ["General", "Members"] as const;
type Tab = (typeof TABS)[number];

const ClubDetailPage = () => {
  const router = useRouter();
  const params = useParams<{ "club-slug": string }>();
  const clubSlug = params["club-slug"];

  const { club, members, isLoading, query } =
    useGetMembershipClubByName(clubSlug);

  const [activeTab, setActiveTab] = useState<Tab>("General");

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="flex h-screen items-center justify-center text-white/40 text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (query.isError || !club) {
    return (
      <div className="relative min-h-screen bg-black">
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
      <div className="relative flex flex-col text-white">
        <ClubBanner club={club} isOwner={club.isOwner} />

        <ClubMeta club={club} members={members} />

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
          <ClubDetailsTab club={club} isOwner={club.isOwner} />
        ) : (
          <MembersTab members={members ?? []} isOwner={club.isOwner} />
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
