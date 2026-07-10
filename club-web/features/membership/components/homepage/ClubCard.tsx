// club-web/features/membership/components/homepage/ClubCard.tsx
import { Users, Globe, Lock, Gem } from "lucide-react";
import { type MembershipClub } from "../../api/club";
import { ClubThumbnail } from "@/features/studio/components/club/ClubThumbnail";
import { getCategory } from "@/features/studio/components/club/constants";
import { useBreakpoints } from "@/hooks/use-breakpoints";

interface ClubCardProps {
  club: MembershipClub;
  onClick?: () => void;
}

const typeConfig = {
  Public: {
    badge: "bg-[#97FFFF] text-[#248582] border border-[#00D0FF]/20",
    button: "border-[#97FFFF]/40 text-[#97FFFF] hover:bg-[#97FFFF]/10",
    action: "Join now",
    icon: Globe,
  },
  Private: {
    badge: "bg-[#A6ADFF] text-[#3F42E1] border border-[#2200FF]/20",
    button: "border-[#A6ADFF]/40 text-[#A6ADFF] hover:bg-[#A6ADFF]/10",
    action: "Request to join",
    icon: Lock,
  },
  Exclusive: {
    badge: "bg-zinc-300 text-zinc-900",
    button: "border-zinc-400/40 text-zinc-300 hover:bg-zinc-800",
    action: "Request invite",
    icon: Gem,
  },
};

export function ClubCard({ club, onClick }: ClubCardProps) {
  const { lg } = useBreakpoints();
  const config = typeConfig[club.clubType];
  const visibleTags = (club.tags ?? []).slice(0, 3);
  const extraTags = (club.tags?.length ?? 0) - visibleTags.length;
  const category = getCategory(club.category);

  return (
    <div
      onClick={onClick}
      className="group h-full min-w-42 sm:min-w-48 overflow-hidden rounded-2xl bg-black p-1 lg:p-2 hover:bg-white/10 cursor-pointer transition-discrete duration-200"
    >
      <div className="relative mb-3">
        <ClubThumbnail
          imageUrl={club.imageUrl}
          name={club.name}
          category={club.category}
          colorVariant={club.category?.toLowerCase()}
          size="video"
          className="transition-transform duration-300"
        />

        {/* Club type badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold ${config.badge}`}
        >
          {club.clubType}
        </span>

        {/* Category badge */}
        {club.category && (
          <span className="hidden sm:absolute bottom-3 left-3 sm:flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white/80 border border-white/20 backdrop-blur-sm">
            {category?.icon}
            {club.category}
          </span>
        )}
      </div>

      <p className="sm:hidden text-sm text-white/60">{club.category}</p>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm sm:text-lg font-bold text-white leading-snug line-clamp-1 sm:line-clamp-2">
          {club.name}
        </h3>

        <>
          {club.description && (
            <p className="mt-1.5 text-sm text-white/50 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {club.description}
            </p>
          )}
          {lg ? (
            <>
              {/* Tags */}
              {visibleTags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-white/70"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {extraTags > 0 && (
                    <span className="text-sm text-white/40">
                      +{extraTags} more
                    </span>
                  )}
                </div>
              )}

              {/* Members */}
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white">
                  <Users className="h-4 w-4" aria-hidden />
                  {club.memberCount ?? club.maxSeats} members
                </span>
              </div>
            </>
          ) : null}
        </>
      </div>
    </div>
  );
}
