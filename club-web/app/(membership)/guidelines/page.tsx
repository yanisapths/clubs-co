"use client";

import Link from "next/link";
import { GuideCard } from "@/features/shared/components/guidelines/GuideCard";
import { GUIDES } from "@/features/shared/components/guidelines/guides";
import { PlayIcon, StarIcon } from "lucide-react";
import { useAccountAuth } from "@/hooks/use-account-auth";

function StudioGuidelinesPage() {
  const { user, isLoggedIn } = useAccountAuth();

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-10">
        <section>
          <p className="text-sm text-neutral-500">Clubspace Platform</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight text-neutral-100 md:text-5xl">
            Start building communities
            <br />
            on Clubspace
          </h1>

          <Link
            href={
              isLoggedIn ? `/${user.username}/studio/club/create` : "/login"
            }
            className="mt-8 inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-5 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            <div className="flex items-center gap-2">
              <PlayIcon className="text-white/50" size={12} /> Quickstart
            </div>
          </Link>
        </section>

        <div className="my-10 h-px w-full bg-neutral-900" />

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-3xl font-medium text-neutral-100">
              Clubspace Guidebook
            </h2>
            <p className="mt-2 text-neutral-500">
              Practical guides for using Clubspace effectively
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GUIDES.map(
                (guide: {
                  slug: string;
                  title: string;
                  description: string;
                }) => (
                  <GuideCard
                    key={guide.slug}
                    title={guide.title}
                    description={guide.description}
                    href={`/guidelines/${guide.slug}`}
                  />
                ),
              )}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-medium text-neutral-100">
              Release notes
            </h2>
            <p className="mt-2 text-neutral-500">
              Updates to Clubspace, including the Studio dashboard, club
              features, and the Clubs API.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <GuideCard
                title="What's new"
                description="Latest features and updates."
                href="/release-notes"
                icon={
                  <StarIcon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-200" />
                }
                isExternal
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default StudioGuidelinesPage;
