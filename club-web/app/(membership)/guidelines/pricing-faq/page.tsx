"use client";

import { FaqAccordion } from "@/features/shared/components/FaqAccordion";
import {
  GuideSection,
  RelatedArticle,
  GuidelineDetailLayout,
} from "@/features/shared/components/guidelines/DetailLayout";
import { GuideSectionBlock } from "@/features/shared/components/guidelines/SectionBlock";

const SECTIONS: GuideSection[] = [
  { id: "how-it-works", label: "How it works" },
  { id: "faq", label: "FAQ" },
];

const RELATED_ARTICLES: RelatedArticle[] = [
  { label: "Pricing FAQ", href: "/guidelines/pricing-faq", active: true },
  { label: "Release notes", href: "/release-notes" },
];

function PricingFaqGuidePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <GuidelineDetailLayout
        title="Pricing FAQ"
        description="Meeteon Clubs is currently in beta and free for everyone. This FAQ covers today's limits and what's coming next for organization and creator pricing."
        metaLabel="Beta 1.0.0 — published July 2026"
        sections={SECTIONS}
      >
        <GuideSectionBlock id="how-it-works" title="How it works">
          <p>
            Meeteon Clubs is in beta (
            <span className="text-neutral-200">Beta 1.0.0</span>, published July
            2026) and free to use for every member — there are no platform fees
            right now.
          </p>
          <p>While it&apos;s free, a couple of limits keep the beta healthy:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-neutral-200">Club creation:</span> each
              member can create up to 5 clubs.
            </li>
            <li>
              <span className="text-neutral-200">Seats:</span> each club can
              hold up to 200 seats, set by the founder.
            </li>
            <li>
              <span className="text-neutral-200">Joining: </span> there&apos;s
              no limit on how many clubs a member can join — only on how many
              they can create.
            </li>
          </ul>
        </GuideSectionBlock>

        <GuideSectionBlock id="faq" title="FAQ">
          <FaqAccordion
            items={[
              {
                question: "Is Meeteon free during the beta?",
                answer: (
                  <p>
                    Yes. Every feature available today — creating clubs,
                    inviting and managing members, and joining clubs — is free
                    for all members while Meeteon Clubs is in beta.
                  </p>
                ),
              },
              {
                question: "How many clubs can I create or join?",
                answer: (
                  <p>
                    You can create up to 5 clubs, and each of those clubs can
                    hold up to 200 seats. There&apos;s no cap on how many clubs
                    you can join as a member — only on how many you can own and
                    how large each one can be.
                  </p>
                ),
              },
              {
                question: "Will Meeteon introduce paid plans later?",
                answer: (
                  <p>
                    Yes. A future release will detail pricing for organizations
                    running clubs at scale, along with a way for creators to
                    monetize exclusive features through subscriptions.
                    We&apos;ll publish full details here once they&apos;re
                    finalized.
                  </p>
                ),
              },
            ]}
          />
        </GuideSectionBlock>
      </GuidelineDetailLayout>
    </div>
  );
}

export default PricingFaqGuidePage;
