"use client";

import {
  GuideSection,
  GuidelineDetailLayout,
} from "@/features/shared/components/guidelines/DetailLayout";
import { GuideSectionBlock } from "@/features/shared/components/guidelines/SectionBlock";

const SECTIONS: GuideSection[] = [
  { id: "profile", label: "Profile" },
  { id: "clubs", label: "Club Memberships" },
  { id: "account-deletion", label: "Account Deletion" },
];

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-neutral-900 px-1.5 py-0.5 text-[13px] text-neutral-300">
      {children}
    </code>
  );
}

function AccountManagementGuidePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <GuidelineDetailLayout
        title="Account Management"
        description="Learn how to manage your profile, review your club memberships, and understand what happens when an account is deleted."
        sections={SECTIONS}
      >
        <GuideSectionBlock id="profile" title="Profile">
          <p>
            Every account includes a public profile containing your display
            name, username, profile image, banner image, bio, social links, and
            account information.
          </p>

          <p>
            Your <span className="text-neutral-200">username</span> is assigned
            to your account and serves as your unique identity across the
            platform. Other profile details can be updated at any time from your
            account settings.
          </p>

          <p>
            The <span className="text-neutral-200">display name</span> can be up
            to 100 characters and does not need to be unique. Multiple users may
            share the same display name.
          </p>

          <p>
            Your <span className="text-neutral-200">bio</span> supports up to{" "}
            <InlineCode>500 characters</InlineCode>. You may also add links to
            supported social platforms to help others discover your work and
            community presence.
          </p>

          <p>
            Your email address is associated with your account and is used for
            authentication and account ownership verification.
          </p>
        </GuideSectionBlock>

        <GuideSectionBlock id="clubs" title="Club Memberships">
          <p>
            Your account dashboard provides a complete overview of every club
            you&rsquo;re involved in, whether you founded it or joined as a
            member.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="text-neutral-200">Club Founded</span> shows the
              number of clubs where you are the Founder.
            </li>
            <li>
              <span className="text-neutral-200">Club Joined</span> shows the
              number of clubs you participate in.
            </li>
          </ul>

          <p>
            For each club, you can view its name, image, your role, and the date
            you became a member.
          </p>

          <p>
            Membership roles may include <InlineCode>Founder</InlineCode>,{" "}
            <InlineCode>Co-Founder</InlineCode>, or{" "}
            <InlineCode>Member</InlineCode>, depending on your position within
            the club.
          </p>
        </GuideSectionBlock>

        <GuideSectionBlock id="account-deletion" title="Account Deletion">
          <p>
            You may permanently delete your account at any time. Account
            deletion is irreversible and immediately removes your profile and
            related ownership data from the platform.
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>All clubs owned by the account are permanently deleted.</li>
            <li>
              Membership records, invitations, requests, and other account-owned
              resources are removed.
            </li>
            <li>
              Your profile information, including images, bio, and social links,
              is deleted.
            </li>
            <li>
              The action cannot be undone after the deletion request has been
              completed.
            </li>
          </ul>

          <p>
            Before deleting your account, ensure that any clubs you own no
            longer contain information or communities you wish to preserve, as
            deleting the account will also remove those clubs from the platform.
          </p>
        </GuideSectionBlock>
      </GuidelineDetailLayout>
    </div>
  );
}

export default AccountManagementGuidePage;
