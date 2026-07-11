"use client";

import Link from "next/link";
import { Callout } from "@/features/shared/components/guidelines/Callout";
import { ReleaseNoteEntry } from "@/features/shared/components/guidelines/ReleaseNoteEntry";
import {
  ReleaseDate,
  ReleaseNotesSidebar,
} from "@/features/shared/components/guidelines/ReleaseNotesSidebar";

const DATES: ReleaseDate[] = [
  { id: "2026-07-11", label: "July 11, 2026" },
  { id: "2026-07-01", label: "July 1, 2026" },
];

function ReleaseNotesPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-10">
        <p className="text-sm text-neutral-500">Release notes</p>
        <h1 className="mt-2 text-4xl font-medium text-neutral-100">
          Clubspace
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-500">
          Updates to Clubspace, including the Studio dashboard, club features,
          and the Clubs API.
        </p>

        <div className="mt-8">
          <Callout>
            <p>
              Looking for a full breakdown of what&apos;s free today and
              what&apos;s coming next? See the{" "}
              <Link
                href="/guidelines/pricing-faq"
                className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
              >
                Pricing FAQ
              </Link>
              .
            </p>
          </Callout>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[1fr_220px]">
          <div className="space-y-16">
            <ReleaseNoteEntry id="2026-07-11" date="July 11, 2026">
              <li>
                Added a new <span className="text-neutral-100">Guidelines</span>{" "}
                section under Studio, covering club creation, roles &amp;
                permissions, quota &amp; limits, and account management. See{" "}
                <Link
                  href="/guidelines"
                  className="underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Guidelines
                </Link>
                .
              </li>
            </ReleaseNoteEntry>

            <ReleaseNoteEntry id="2026-07-01" date="July 1, 2026">
              <li>
                Clubspace Clubs is now in{" "}
                <span className="text-neutral-100">beta</span> (
                <span className="text-neutral-100">Beta 1.0.0</span>) and free
                to use for every member — there are no platform fees during this
                phase.
              </li>
              <li>
                Club creation is capped at{" "}
                <span className="text-neutral-100">5 clubs per member</span>,
                with a maximum of{" "}
                <span className="text-neutral-100">200 seats</span> per club.
              </li>
              <li>
                There&apos;s no limit on how many clubs a member can{" "}
                <span className="text-neutral-100">join</span> — only on how
                many clubs they can create and how many seats each club has
                available.
              </li>
              <li>
                Pricing for organizations and creator monetization — including
                subscriptions on exclusive features — will be announced in a
                future release. See{" "}
                <Link
                  href="/guidelines/pricing-faq"
                  className="underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Pricing FAQ
                </Link>
                .
              </li>
            </ReleaseNoteEntry>
          </div>

          <ReleaseNotesSidebar dates={DATES} />
        </div>
      </main>
    </div>
  );
}

export default ReleaseNotesPage;
