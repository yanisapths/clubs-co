"use client";

import { Space } from "@/features/studio/api/club";
import {
  ClubFormData,
  ClubVisibility,
  initialClubFormData,
  SocialPlatform,
} from "@/features/studio/components/club/create";
import { EditClubForm } from "@/features/studio/components/club/edit/form";
import { useGetClubById } from "@/features/studio/hooks/use-club";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

const visibilityReverseMap: Record<"Anyone" | "MemberOnly", ClubVisibility> = {
  Anyone: "Anyone",
  MemberOnly: "Club member only",
};
export default function EditClubPage() {
  const params = useParams();
  const clubId = Number(params["club-slug"]);
  const pathname = usePathname();
  const isEdit = pathname.endsWith("/edit");

  const { club, isLoading: isLoadingClub } = useGetClubById(clubId);

  const platformDisplayMap: Record<string, SocialPlatform> = {
    website: "Website",
    x: "X",
    meta: "Meta",
    instagram: "Instagram",
  };

  const derivedInitialData = useMemo<ClubFormData>(() => {
    if (!club) return initialClubFormData;

    const socialLinks = (club.socialLinks ?? []).map(
      (record: Record<string, string>, index: number) => {
        const [key, url] = Object.entries(record)[0] ?? ["website", ""];
        return {
          id: String(index),
          platform: platformDisplayMap[key.toLowerCase()] ?? "Website",
          url: url ?? "",
        };
      },
    );

    const spaces = (club.spaces ?? []).map((s: Space) => ({
      id: String(s.id ?? crypto.randomUUID()),
      name: s.name ?? "",
    }));

    return {
      ...initialClubFormData,
      name: club.name ?? "",
      description: club.description ?? "",
      category: club.category?.id ?? null,
      clubType: club.clubType ?? initialClubFormData.clubType,
      visibility:
        visibilityReverseMap[club.visibility as "Anyone" | "MemberOnly"] ??
        initialClubFormData.visibility,
      maxSeats: club.maxSeats ?? initialClubFormData.maxSeats,
      tags: (club.tags ?? []).map((t) => t.name ?? "").filter(Boolean),
      spaces: spaces,
      socialLinks,
      allowFollowers: club.allowFollowers ?? initialClubFormData.allowFollowers,
      activate: club.activate ?? initialClubFormData.activate,
      image: null,
      imagePreview: club.imageUrl ?? null,
    };
  }, [club]);

  if (isLoadingClub) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0c0c] text-white">
        <p className="text-white/50">Loading club...</p>
      </div>
    );
  }

  return (
    <EditClubForm
      clubId={clubId}
      initialData={derivedInitialData}
      isEdit={isEdit}
    />
  );
}
