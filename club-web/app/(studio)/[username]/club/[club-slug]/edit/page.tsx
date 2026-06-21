"use client";

import { Space } from "@/features/studio/api/club";
import { visibilityReverseMap } from "@/features/studio/components/club/constants";
import {
  ClubFormData,
  initialClubFormData,
  SocialPlatform,
} from "@/features/studio/components/club/create";
import { EditClubForm } from "@/features/studio/components/club/edit/form";
import { useGetClubById } from "@/features/studio/hooks/use-club";
import { ApiError } from "@/lib/api-types";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export default function EditClubPage() {
  const params = useParams();
  const clubId = Number(params["club-slug"]);
  const pathname = usePathname();
  const isEdit = pathname.endsWith("/edit");

  const { query, club, isLoading: isLoadingClub } = useGetClubById(clubId);

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

  if (query.isError) {
    const error = query.error;
    const message =
      error instanceof ApiError ? error.message : "Failed to load club";
    const is404 = error instanceof ApiError && error.code === 404;

    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0c0c] text-white">
        <p className="text-white/50">{is404 ? "Club not found" : message}</p>
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
