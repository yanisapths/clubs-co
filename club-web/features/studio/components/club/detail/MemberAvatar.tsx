import { ClubDetail } from "@/features/studio/api/club";

export type ClubMember = ClubDetail["members"][number];

export const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-violet-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-400",
  "bg-sky-500",
  "bg-rose-500",
  "bg-teal-400",
];

export function avatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function MemberAvatar({
  username,
  size = "md",
}: {
  username: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${sizeClass} ${avatarColor(username)} flex shrink-0 items-center justify-center rounded-full font-semibold text-white uppercase`}
    >
      {username[0]}
    </div>
  );
}
