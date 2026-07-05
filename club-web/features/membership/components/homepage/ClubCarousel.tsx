// club-web/features/membership/components/homepage/ClubCarousel.tsx
"use client";

import { useRouter } from "next/navigation";
import { ClubCard } from "./ClubCard";
import { type MembershipClub } from "../../api/club";
import { toClubSlug } from "@/lib/utils";
import { Carousel } from "@/features/shared/components/Carousel";

interface ClubsCarouselProps {
  clubs: MembershipClub[];
}

export function ClubsCarousel({ clubs }: ClubsCarouselProps) {
  const router = useRouter();

  return (
    <Carousel
      items={clubs}
      keyExtractor={(club) => club.id}
      itemClassName="w-[400px]"
      renderItem={(club) => (
        <ClubCard
          club={club}
          onClick={() => router.push(`/club/${toClubSlug(club.name)}`)}
        />
      )}
    />
  );
}
