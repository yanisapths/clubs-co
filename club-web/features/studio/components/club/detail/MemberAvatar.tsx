import { ClubDetail } from "@/features/studio/api/club";

export type ClubMember = ClubDetail["members"][number];

export function MemberAvatar({
  displayName,
  size = "md",
}: {
  displayName: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-md";
  return (
    <div
      className={`${sizeClass} bg-zinc-900 font-semibold border border-white/20 flex shrink-0 items-center justify-center rounded-full text-white uppercase`}
    >
      {displayName[0]}
    </div>
  );
}
