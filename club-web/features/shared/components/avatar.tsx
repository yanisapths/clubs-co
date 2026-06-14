"use client";

import { useAccountAuth } from "@/hooks/use-account-auth";
import { cn } from "@/lib/utils";

interface AvatarProps {
  firstName: string;
  lastName?: string;
  className?: string;
  size?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Curated gradient pairs (start, end)
const GRADIENTS: [string, string][] = [
  ["#9333EA", "#C084FC"], // purple
  ["#2563EB", "#38BDF8"], // blue
  ["#059669", "#34D399"], // green
  ["#DB2777", "#F472B6"], // pink
  ["#D97706", "#FBBF24"], // amber
  ["#DC2626", "#F87171"], // red
  ["#0891B2", "#67E8F9"], // cyan
  ["#7C3AED", "#A78BFA"], // violet
];

export function getInitials(firstName: string, lastName?: string) {
  const first = firstName?.trim()[0] ?? "";
  const second = lastName?.trim()[0] ?? firstName?.trim()[1] ?? "";
  return (first + second).toUpperCase();
}

export function getGradient(seedKey: string) {
  const seed = hashString(seedKey.toLowerCase().trim() || "anon");
  return GRADIENTS[seed % GRADIENTS.length];
}

export function Avatar({
  firstName,
  lastName,
  className,
  size = 48,
}: AvatarProps) {
  const { user } = useAccountAuth();

  const initials = getInitials(
    user.firstName ?? firstName,
    user.lastName ?? lastName,
  );
  const [from, to] = getGradient(user.id ?? "anon");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full justify-center text-center place-content-center",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <p className="flex justify-center text-white">{initials}</p>
    </div>
  );
}
