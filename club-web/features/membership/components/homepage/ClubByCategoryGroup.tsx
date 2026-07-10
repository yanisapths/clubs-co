import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { ClubsCarousel } from "./ClubCarousel";
import { ClubCard } from "./ClubCard";
import { categories } from "@/features/shared/constants";
import { toClubSlug } from "@/lib/utils";
import { useGetClubsByCategory } from "../../hooks/use-club";
import { Spinner } from "@heroui/react";

function ClubCategorySection({
  category,
}: {
  category: (typeof categories)[number];
}) {
  const router = useRouter();
  const { clubs, isLoading } = useGetClubsByCategory(category.slug, 12);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-black text-white">
        <main className="flex flex-col h-screen w-screen px-4 md:px-6 lg:px-12 pb-10 pt-20 justify-center items-center">
          <Spinner />
        </main>
      </div>
    );
  }

  if (clubs.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {" "}
      <div>
        {" "}
        <p className="text-2xl">{category.category} Clubs</p>{" "}
        <p className="text-base text-white/60 mt-1">{category.caption} </p>{" "}
      </div>
      <div className="hidden sm:block">
        <ClubsCarousel clubs={clubs} />
      </div>
      <div className="block sm:hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-none">
          {clubs.map((club) => (
            <div key={club.id} className="shrink-0 w-[220px]">
              <ClubCard
                club={club}
                onClick={() => router.push(`/club/${toClubSlug(club.name)}`)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex sm:justify-end">
        <button
          onClick={() => router.push(`/category/${category.slug}`)}
          className="sm:w-fit sm:px-4 cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-white/35 hover:text-white transition-colors"
        >
          View all clubs <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export const ClubByCategoryGroup = () => {
  return (
    <div className="flex flex-col gap-12">
      {categories.map((category) => (
        <ClubCategorySection key={category.id} category={category} />
      ))}{" "}
    </div>
  );
};
