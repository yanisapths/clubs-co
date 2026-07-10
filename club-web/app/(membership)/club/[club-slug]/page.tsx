"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MembersTab } from "@/features/studio/components/club/detail/MemberTab";
import {
  ClubBanner,
  ClubMeta,
} from "@/features/studio/components/club/detail/ClubMeta";
import {
  useGetClubMemberListByName,
  useGetMembershipClubByName,
} from "@/features/membership/hooks/use-club";
import { ClubDetailsTab } from "@/features/membership/components/club/DetailTab";
import { JoinFooter } from "@/features/membership/components/club/JoinFooter";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useModal } from "@/hooks/use-modal";
import { InviteMemberModal } from "@/features/shared/components/InviteMemberModal";

const TABS = ["General", "Members"] as const;
type Tab = (typeof TABS)[number];

const ClubDetailPage = () => {
  const router = useRouter();
  const { user } = useAccountAuth();
  const params = useParams<{ "club-slug": string }>();
  const clubSlug = params["club-slug"];
  const { club, isLoading, query } = useGetMembershipClubByName(clubSlug);
  const {
    members,
    isLoading: isMemberLoading,
    query: memberQuery,
  } = useGetClubMemberListByName(clubSlug);
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const { show: showInvite } = useModal();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (isLoading || isMemberLoading) {
    return (
      <div className="relative min-h-screen bg-black">
        <div className="flex h-screen items-center justify-center text-white/40 text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (memberQuery.isError || query.isError || !club) {
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
    <div className="relative bg-black flex flex-col min-h-screen">
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
        <ClubDetailsTab
          club={club}
          isOwner={club.isOwner}
          setIsGalleryOpen={setIsGalleryOpen}
        />
      ) : (
        <MembersTab
          members={members ?? []}
          isOwner={club.isOwner}
          onInvite={showInvite}
          clubId={club.id}
          onMemberInvited={() => memberQuery.refetch()}
          currentUserId={user.id}
        />
      )}

      {activeTab == "General" ? (
        <div
          className={`sticky bottom-0 mt-6 z-50 transition-opacity duration-200 ${
            isGalleryOpen ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <JoinFooter club={club} clubSlug={clubSlug} />
        </div>
      ) : null}

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        clubId={club.id}
        existingMembers={members || []}
        onInvited={() => memberQuery.refetch()}
      />
    </div>
  );
};

export default ClubDetailPage;
