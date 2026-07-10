"use client";

import {
  GuideSection,
  GuidelineDetailLayout,
} from "@/features/shared/components/guidelines/DetailLayout";
import { GuideSectionBlock } from "@/features/shared/components/guidelines/SectionBlock";

const SECTIONS: GuideSection[] = [
  { id: "creation", label: "Creation" },
  { id: "roles-permissions", label: "Roles & Permissions" },
  { id: "quota-limits", label: "Quota & Limits" },
];

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[13px] text-neutral-300">
      {children}
    </code>
  );
}

function ClubManagementGuidePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <GuidelineDetailLayout
        title="Club Management"
        description="Learn how to create a club and other limitations that all the club creator should acknowledge and follows."
        sections={SECTIONS}
      >
        <GuideSectionBlock id="creation" title="Creation">
          <p>
            Anyone can create a club from the Studio dashboard. Give it a name
            (2–100 characters), a club type, a visibility, a category, and a
            seat limit between 1 and 200. Description, up to 3 tags, and spaces
            are optional.
          </p>
          <p>
            <span className="text-neutral-200">Club type</span> controls how
            people join: <InlineCode>Public</InlineCode> clubs can be joined
            directly, while <InlineCode>Private</InlineCode> and{" "}
            <InlineCode>Exclusive</InlineCode> clubs require a join request that
            the founder has to approve.
          </p>
          <p>
            <span className="text-neutral-200">Visibility</span> controls who
            can discover the club — <InlineCode>Anyone</InlineCode> or{" "}
            <InlineCode>MemberOnly</InlineCode> — separately from who is allowed
            to join it.
          </p>
          <p>
            The account that creates a club is automatically assigned the{" "}
            <span className="text-neutral-200">Founder</span> role. This
            assignment is permanent — the founder role can never be handed out
            through an invitation.
          </p>
        </GuideSectionBlock>

        <GuideSectionBlock id="roles-permissions" title="Roles & Permissions">
          <p>
            Every club has three ranks, and permissions only flow downward — a
            role can never take action against a member who outranks it.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-200">
                Founder — rank 1
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Assigned automatically on creation, and permanent — the
                  founder can never leave or be removed from their own club.
                </li>
                <li>
                  Can invite, approve join requests, cancel invites or requests,
                  and remove any other member.
                </li>
                <li>The only role that can edit or delete the club itself.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-200">
                Co-Founder — rank 2
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Can leave the club voluntarily.</li>
                <li>
                  Can invite, approve, cancel, and remove members ranked below
                  them (Members), but can&apos;t take any action against the
                  Founder.
                </li>
                <li>
                  Cannot manage club settings — a co-founder&apos;s permissions
                  are limited to managing members, not the club itself.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-200">
                Member — rank 3
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Can leave the club voluntarily.</li>
                <li>
                  No management permissions over the club or other members.
                </li>
              </ul>
            </div>
          </div>
        </GuideSectionBlock>

        <GuideSectionBlock id="quota-limits" title="Quota & Limits">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Each user can own up to{" "}
              <span className="text-neutral-200">5 clubs</span>.
            </li>
            <li>
              Each club can hold up to{" "}
              <span className="text-neutral-200">200 seats</span>, set by the
              founder at creation.
            </li>
            <li>
              There&apos;s no limit on how many clubs a user can join as a
              member — but every club still enforces its own seat cap, so a join
              request or invite can&apos;t be accepted once a club is full.
            </li>
            <li>
              Private and exclusive clubs always go through a
              request-and-approve flow; the founder decides who gets in even
              when seats are still available.
            </li>
          </ul>
        </GuideSectionBlock>
      </GuidelineDetailLayout>
    </div>
  );
}

export default ClubManagementGuidePage;
