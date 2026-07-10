"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeartCrackIcon, Loader2 } from "lucide-react";
import { ClubCard } from "@/features/membership/components/homepage/ClubCard";
import { useInfiniteClubsByCategory } from "@/features/membership/hooks/use-infinite-clubs-by-category";
import { categories } from "@/features/shared/constants";
import { Spinner } from "@heroui/react";
import { toClubSlug } from "@/lib/utils";
import { CategoryCard } from "@/features/membership/components/homepage/CategoryCard";

export default function CategoryPage() {
  const params = useParams<{ "category-slug": string }>();
  const router = useRouter();
  const slug = params["category-slug"];

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [slug],
  );

  const otherCategories = categories.filter((c) => c.slug !== slug);

  const { clubs, isLoading, hasMore, error, sentinelRef } =
    useInfiniteClubsByCategory(slug, { pageSize: 12 });

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
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              {category?.category ?? "Category"}
            </h1>
            <p className="mx-auto mt-3 text-xl text-white/90">
              {category?.caption}
            </p>
          </div>

          <div className="hidden md:flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-white">
              Categories to explore
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((c) => (
                <CategoryCard
                  key={c.id}
                  {...c}
                  onClick={() => router.push(`/category/${c.slug}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-6 text-center text-red-400">
            Couldn&rsquo;t load clubs. Please try again.
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-white/5"
                />
              ))
            : clubs.map((club) => (
                <div key={club.id} className="w-[120px]">
                  <ClubCard
                    club={club}
                    onClick={() =>
                      router.push(`/club/${toClubSlug(club.name)}`)
                    }
                  />
                </div>
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

        <div className="md:hidden mt-4 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">
            Other categories to explore
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {otherCategories.map((c) => (
              <CategoryCard
                key={c.id}
                {...c}
                onClick={() => router.push(`/category/${c.slug}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
