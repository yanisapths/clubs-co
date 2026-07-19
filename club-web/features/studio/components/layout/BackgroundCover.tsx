"use client";

import { useAccountAuth } from "@/hooks/use-account-auth";
import { getGradient } from "../../utils/utils";

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
