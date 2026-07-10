"use client";

import { ArrowRight } from "@/design-system/components/icons/ArrowRight";
import { CategoryCarousel } from "@/features/membership/components/homepage/CategoryCarousel";
import { ClubByCategoryGroup } from "@/features/membership/components/homepage/ClubByCategoryGroup";
import { ClubCard } from "@/features/membership/components/homepage/ClubCard";
import { ClubsCarousel } from "@/features/membership/components/homepage/ClubCarousel";
import { useGetMembershipClubs } from "@/features/membership/hooks/use-club";
import { GlobalSearchTrigger } from "@/features/shared/components/GlobalSearchTrigger";
import { categories } from "@/features/shared/constants";
import { toClubSlug } from "@/lib/utils";
import { Typography } from "@heroui/react/typography";
import { useRouter } from "next/navigation";

export default function Home() {
  const { clubs } = useGetMembershipClubs();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white pt-20">
      <main className="flex flex-col h-full w-screen px-4 md:px-6 lg:px-12 pb-16">
        <div className="flex gap-6 flex-col justify-center items-center place-content-center">
          <div className="flex flex-col mt-4 gap-2.5 justify-center items-center text-center place-content-center">
            <Typography type="h1" className="text-white">
              Explore Clubs
            </Typography>
            <Typography className="text-white text-lg font-regular">
              Find your space
            </Typography>
          </div>

          <div className="flex flex-col w-full gap-8">
            <div className="flex flex-col gap-2.5 lg:justify-center lg:items-center">
              <div className="w-full lg:w-[700px]">
                <GlobalSearchTrigger />
              </div>
            </div>
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-2xl">Explore categories</p>
                  <p className="text-base text-white/60 mt-1">
                    Easily navigate to every clubs by exploring these
                    categories.
                  </p>
                </div>
                <div className="flex flex-col gap-5">
                  <CategoryCarousel categories={categories} />
                </div>
              </div>
            </div>
            {/* Clubs */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-3xl">Explore clubs</p>
                <p className="text-base text-white/60 mt-1">
                  Clubspace is the place to grow communities and share passion
                  in spaces where people connect.
                </p>
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
                        onClick={() =>
                          router.push(`/club/${toClubSlug(club.name)}`)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex sm:justify-end">
                <button
                  onClick={() => router.push("/club")}
                  className="sm:w-fit sm:px-4 cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-white/35 hover:text-white transition-colors"
                >
                  View all clubs <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Clubs by Categories */}
            <ClubByCategoryGroup />
          </div>
        </div>
      </main>
    </div>
  );
}
