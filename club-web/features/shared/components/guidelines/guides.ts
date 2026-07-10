export interface Guide {
  slug: string;
  title: string;
  description: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "club-management",
    title: "Club Management",
    description:
      "Learn how club works and limitations that the creators should acknowledge and follow.",
  },
  {
    slug: "membership",
    title: "Membership",
    description:
      "Learn how membership in each clubs works for founders, co-founders, and members.",
  },
  {
    slug: "account-management",
    title: "Account Management",
    description: "This guide explains how to get support for your account.",
  },
  {
    slug: "help-support",
    title: "Help & Support",
    description:
      "How to reach the Clubspace team when something isn't working as expected.",
  },
];
