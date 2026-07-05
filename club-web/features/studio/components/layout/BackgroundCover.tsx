"use client";

import { getGradient } from "@/features/shared/components/Avatar";
import { useAccountAuth } from "@/hooks/use-account-auth";

export const BackgroundCover = () => {
  const { user } = useAccountAuth();
  const [from, to] = getGradient(user.id ?? "anon");

  return (
    <div
      className="relative h-40 w-full z-0 blur-3xl opacity-90 overflow-hidden rounded-none lg:rounded-xl"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  );
};
