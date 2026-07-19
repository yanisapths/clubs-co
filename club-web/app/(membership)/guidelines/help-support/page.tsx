"use client";

import {
  GuideSection,
  GuidelineDetailLayout,
} from "@/features/shared/components/guidelines/DetailLayout";
import { GuideSectionBlock } from "@/features/shared/components/guidelines/SectionBlock";

const SECTIONS: GuideSection[] = [{ id: "overview", label: "Overview" }];

function HelpSupportGuidePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <GuidelineDetailLayout
        title="Help & Support"
        description="How to reach the Meeteon team when something isn't working as expected."
        sections={SECTIONS}
      >
        <GuideSectionBlock id="overview" title="Overview">
          <p>This guide is coming soon. Check back shortly.</p>
        </GuideSectionBlock>
      </GuidelineDetailLayout>
    </div>
  );
}

export default HelpSupportGuidePage;
