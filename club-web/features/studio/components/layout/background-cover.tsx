"use client";

import { getGradient } from "@/features/shared/components/avatar";
import { useAccountAuth } from "@/hooks/use-account-auth";

export const BackgroundCover = () => {
  const { user } = useAccountAuth();
  const [from, to] = getGradient(user.id ?? "anon");

  return (
    <div
      className="fixed left-0 top-0 z-0 h-72 w-full blur-3xl opacity-90"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  );
};
