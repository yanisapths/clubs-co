//club-web/app/(membership)/category/[category-slug]/page.tsx
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeartCrackIcon, Loader2 } from "lucide-react";
import { ClubCard } from "@/features/membership/components/homepage/ClubCard";
import { useInfiniteClubs } from "@/features/membership/hooks/use-infinite-clubs";
import { categories } from "@/features/shared/constants";
import { Spinner } from "@heroui/react";
import { toClubSlug } from "@/lib/utils";

export default function CategoryPage() {
  const params = useParams<{ "category-slug": string }>();
  const router = useRouter();
  const slug = params["category-slug"];

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [slug],
  );

  const { clubs, isLoading, hasMore, error, sentinelRef } = useInfiniteClubs(
    slug,
    { pageSize: 12 },
  );

  const otherCategories = categories.filter((c) => c.slug !== slug);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-black text-white">
        <main className="flex flex-col h-screen w-screen px-4 md:px-6 lg:px-12 pb-10 pt-32 justify-center items-center">
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
      <main className="flex flex-col h-full w-screen px-4 md:px-6 lg:px-12 pb-10 pt-32">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {category?.category ?? "Category"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-white/90">
            {category?.caption}
          </p>
        </div>

        {error && (
          <p className="mb-6 text-center text-red-400">
            Couldn&rsquo;t load clubs. Please try again.
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-white/5"
                />
              ))
            : clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onClick={() => router.push(`/club/${toClubSlug(club.name)}`)}
                />
              ))}
        </div>

        {!isLoading && hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        )}

        {!isLoading && !hasMore && clubs.length == 0 && (
          <div className="flex flex-col min-h-84 justify-center m-auto text-center">
            <HeartCrackIcon size={200} className="opacity-30 rotate-10" />
            <div className="text-white/60">No clubs in this category.</div>
          </div>
        )}
        <div className="mt-16">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Other categories to explore
          </h2>
          <div className="flex flex-wrap gap-4">
            {otherCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/category/${c.slug}`)}
                className="cursor-pointer flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white/80 transition-colors hover:bg-white/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  {c.icon}
                </span>
                {c.category}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
