// club-web/features/membership/components/homepage/ClubCarousel.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ClubCard } from "./ClubCard";
import { type MembershipClub } from "../../api/club"; // ← was importing Club from studio
import { useRouter } from "next/navigation";
import { toClubSlug } from "@/lib/utils";

interface ClubsCarouselProps {
  clubs: MembershipClub[];
}

export function ClubsCarousel({ clubs }: ClubsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const router = useRouter();
  const showNav = clubs.length >= 6;

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    updateState();
    return () => el.removeEventListener("scroll", updateState);
  }, [updateState]);

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {showNav && (
        <>
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-40 z-10 bg-gradient-to-r from-black to-transparent transition-opacity duration-200 ${
              atStart ? "opacity-0" : "opacity-100"
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-40 z-10 bg-gradient-to-l from-black to-transparent transition-opacity duration-200 ${
              atEnd ? "opacity-0" : "opacity-100"
            }`}
          />
        </>
      )}

      {showNav && !atStart && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {showNav && !atEnd && (
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-200"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-none">
        {clubs.map((club) => (
          <div key={club.id} className="shrink-0 w-[400px]">
            <ClubCard
              club={club}
              onClick={() => router.push(`/club/${toClubSlug(club.name)}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
