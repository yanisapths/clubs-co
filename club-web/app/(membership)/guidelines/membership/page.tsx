"use client";

import {
  GuideSection,
  GuidelineDetailLayout,
} from "@/features/shared/components/guidelines/DetailLayout";
import { GuideSectionBlock } from "@/features/shared/components/guidelines/SectionBlock";

const SECTIONS: GuideSection[] = [
  { id: "joining", label: "Joining Clubs" },
  { id: "invitations", label: "Invitations" },
  { id: "membership-roles", label: "Membership Roles" },
  { id: "leaving", label: "Leaving Clubs" },
];

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[13px] text-neutral-300">
      {children}
    </code>
  );
}

function MembershipGuidePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <GuidelineDetailLayout
        title="Membership"
        description="Learn how to join clubs, receive invitations, understand membership roles, and manage your participation in club communities."
        sections={SECTIONS}
      >
        <GuideSectionBlock id="joining" title="Joining Clubs">
          <p>
            Club membership depends on the club&rsquo;s type and the permissions
            set by its founder. Some clubs can be joined instantly, while others
            require approval before membership is granted.
          </p>

          <p>
            <InlineCode>Public</InlineCode> clubs can be joined immediately as
            long as seats are available. Once joined, you&rsquo;ll be assigned
            the <span className="text-neutral-200">Member</span> role.
          </p>

          <p>
            <InlineCode>Private</InlineCode> and{" "}
            <InlineCode>Exclusive</InlineCode> clubs cannot be joined directly.
            Membership requires either an invitation from club management or a
            join request that must be approved.
          </p>

          <p>
            Every club enforces its own seat limit. Membership requests,
            invitations, and direct joins cannot be completed once the club has
            reached its maximum capacity.
          </p>
        </GuideSectionBlock>

        <GuideSectionBlock id="invitations" title="Invitations">
          <p>
            Club management may invite users to join a club. Invitations can be
            sent as either a regular member or a co-founder depending on the
            responsibilities intended for the recipient.
          </p>

          <p>
            When you receive an invitation, you&rsquo;ll be able to review
            details about the club, who invited you, when the invitation was
            sent, and the role being offered.
          </p>

          <p>Invitations may grant one of the following roles:</p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <InlineCode>Member</InlineCode> — standard participation in club
              activities.
            </li>
            <li>
              <InlineCode>Co-Founder</InlineCode> — elevated permissions to help
              manage club members.
            </li>
          </ul>

          <p>
            The <span className="text-neutral-200">Founder</span> role can never
            be assigned through an invitation. The account that originally
            created the club remains the founder permanently.
          </p>
        </GuideSectionBlock>

        <GuideSectionBlock id="membership-roles" title="Membership Roles">
          <p>
            Every member belongs to one of three ranks within a club. Roles
            determine what actions a member can perform.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-200">Founder</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Automatically assigned when creating a club.</li>
                <li>Has complete control over the club and its members.</li>
                <li>Can invite, approve, remove, and manage members.</li>
                <li>Cannot leave their own club.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-200">
                Co-Founder
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Assigned through an invitation from club management.</li>
                <li>Can help manage club members.</li>
                <li>Cannot take action against the Founder.</li>
                <li>May leave the club voluntarily.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-200">Member</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Standard club participant.</li>
                <li>No management permissions.</li>
                <li>May leave the club voluntarily.</li>
              </ul>
            </div>
          </div>
        </GuideSectionBlock>

        <GuideSectionBlock id="leaving" title="Leaving Clubs">
          <p>
            Members and co-founders may leave a club at any time. Once you leave
            a club, your membership record is removed and you&rsquo;ll no longer
            have access to member-only areas or content.
          </p>

          <p>
            Founders cannot leave their own clubs. Because the founder is the
            permanent owner of a club, the only way to remove founder ownership
            is to delete the club itself.
          </p>

          <p>
            If you later wish to rejoin a club you&rsquo;ve left, you&rsquo;ll
            need to follow that club&rsquo;s normal membership process again,
            whether that&rsquo;s direct joining, a request for approval, or
            receiving a new invitation.
          </p>
        </GuideSectionBlock>
      </GuidelineDetailLayout>
    </div>
  );
}

export default MembershipGuidePage;
