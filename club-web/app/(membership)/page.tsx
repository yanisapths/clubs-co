"use client";

import { ArrowRight } from "@/design-system/components/icons/ArrowRight";
import { CategoryCard } from "@/features/membership/components/homepage/category-card";
import { ClubCard } from "@/features/membership/components/homepage/club-card";
import { ClubsCarousel } from "@/features/membership/components/homepage/club-carousel";
import { MOBILE_CATEGORY_LIMIT } from "@/features/membership/components/homepage/constants";
import { topics, clubs } from "@/features/membership/components/homepage/data";
import { SearchModal } from "@/features/membership/components/homepage/search-club-modal";
import { TopicCard } from "@/features/membership/components/homepage/topic-card";
import { Input } from "@/features/shared/components/input/Input";
import { categories } from "@/features/shared/constants";
import { useBreakpoints } from "@/hooks/use-breakpoints";
import { useModal } from "@/hooks/use-modal";

import { Typography } from "@heroui/react/typography";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { close, visible, show } = useModal();
  const { lg } = useBreakpoints();
  const router = useRouter();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const visibleCategories =
    !lg && !categoriesExpanded
      ? categories.slice(0, MOBILE_CATEGORY_LIMIT)
      : categories;

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
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
                <Input
                  onClick={show}
                  placeholder="Search clubs, spaces, communities"
                  leftSection={<Search size={24} className="text-white/50" />}
                />
              </div>
              <SearchModal isOpen={visible} onClose={close} />
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {visibleCategories.map((category) => (
                      <CategoryCard key={category.id} {...category} />
                    ))}
                  </div>

                  {!lg && (
                    <button
                      onClick={() => setCategoriesExpanded((prev) => !prev)}
                      className="cursor-pointer flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-white/15 text-white/55 text-sm hover:border-white/30 hover:text-white/80 transition-colors lg:hidden"
                    >
                      {categoriesExpanded ? (
                        <>
                          See less <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          See all categories <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-2xl">Trending Topics</p>
                  <p className="text-base text-white/60 mt-1">
                    Explore what people are talking about.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={topics.length > 12 ? "shrink-0" : ""}
                    >
                      <TopicCard {...topic} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Clubs */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-2xl">Explore clubs</p>
                <p className="text-base text-white/60 mt-1">
                  Clubspace is the place to grow communities and share passion
                  in spaces where people connect.
                </p>
              </div>

              {lg ? (
                <ClubsCarousel clubs={clubs} />
              ) : (
                <div className="overflow-x-auto scrollbar-none">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateRows: "repeat(2, auto)",
                      gridAutoFlow: "column",
                      gridAutoColumns: "175px",
                      width: "max-content",
                    }}
                  >
                    {clubs.map((club) => (
                      <div key={club.id} className="w-[180px]">
                        <ClubCard {...club} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!lg && (
                <button
                  onClick={() => router.push("/club")}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:border-white/35 hover:text-white transition-colors lg:hidden"
                >
                  View all clubs <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
