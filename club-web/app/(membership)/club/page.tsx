"use client";

import { useRouter } from "next/navigation";
import { HeartCrackIcon, Loader2 } from "lucide-react";
import { ClubCard } from "@/features/membership/components/homepage/ClubCard";
import { categories } from "@/features/shared/constants";
import { Spinner } from "@heroui/react";
import { toClubSlug } from "@/lib/utils";
import { CategoryCard } from "@/features/membership/components/homepage/CategoryCard";
import { useInfiniteClubs } from "@/features/membership/hooks/use-infinite-clubs";

export default function AllClubListPage() {
  const router = useRouter();

  const { clubs, isLoading, hasMore, error, sentinelRef } = useInfiniteClubs(
    undefined,
    { pageSize: 12 },
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-black text-white">
        <main className="flex flex-col h-screen w-screen px-4 md:px-6 lg:px-12 pb-10 pt-20 justify-center items-center">
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
      <main className="flex flex-col gap-12 h-full w-screen px-4 md:px-6 lg:px-12 pb-10 pt-24">
        {error && (
          <p className="mb-6 text-center text-red-400">
            Couldn&rsquo;t load clubs. Please try again.
          </p>
        )}
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Discover Clubs
            </h1>
            <p className="mx-auto mt-3 text-xl text-white/90">
              Meeteon is the place to grow communities and share passion in
              spaces where people connect.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white">
            Categories to explore
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                {...c}
                onClick={() => router.push(`/category/${c.slug}`)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {clubs.map((club) => (
            <div key={club.id}>
              <ClubCard
                club={club}
                onClick={() => router.push(`/club/${toClubSlug(club.name)}`)}
              />
            </div>
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        )}

        {!hasMore && clubs.length === 0 && (
          <div className="flex flex-col min-h-84 justify-center m-auto text-center">
            <HeartCrackIcon size={200} className="opacity-30 rotate-10" />
            <div className="text-white/60">No clubs found.</div>
          </div>
        )}
      </main>
    </div>
  );
}
