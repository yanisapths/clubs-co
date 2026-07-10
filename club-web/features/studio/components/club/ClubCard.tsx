// club-web/features/studio/components/club/ClubCard.tsx
import { Users, MapPin } from "lucide-react";
import { type Club } from "../../api/club";
import { ClubThumbnail } from "./ClubThumbnail";
import { getCategory, getCategoryGradient } from "./constants";

interface ClubCardProps {
  club: Club;
  onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
  const visibleTags = club.tags.slice(0, 3);
  const extraTags = club.tags.length - visibleTags.length;

  const visibleSpaces = club.spaces.slice(0, 2);
  const extraSpaces = club.spaces.length - visibleSpaces.length;

  const category = getCategory(club.category.name);

  const badgeStyle =
    club.clubType === "Public"
      ? "bg-[#97FFFF] text-[#248582] border border-[#00D0FF]/20"
      : club.clubType === "Private"
        ? "bg-[#A6ADFF] text-[#3F42E1] border border-[#2200FF]/20"
        : "bg-zinc-300 text-zinc-900";

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl"
        style={{ background: getCategoryGradient(club.category.name) }}
      >
        <ClubThumbnail
          imageUrl={club.imageUrl}
          name={club.name}
          category={club.category.name}
          colorVariant={category?.colorVariant}
          size="video"
        />

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold ${badgeStyle}`}
        >
          {club.clubType}
        </span>

        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white/80 border border-white/20 backdrop-blur-sm">
          {category?.icon}
          {club.category.name}
        </span>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="text-lg font-bold text-white leading-snug line-clamp-3">
          {club.name}
        </h3>

        <p className="mt-1.5 text-sm text-white/50 line-clamp-3 leading-relaxed">
          {club.description}
        </p>

        {club.tags.length > 0 && (
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
              <span className="text-sm text-white/40">+{extraTags} more</span>
            )}
          </div>
        )}
        {/* Spaces */}
        {club.spaces.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {visibleSpaces.map((space) => (
              <span
                key={space.id}
                className="flex items-center gap-1 text-sm text-white/40"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {space.name}
              </span>
            ))}
            {extraSpaces > 0 && (
              <span className="text-sm text-white/40">+{extraSpaces} more</span>
            )}
          </div>
        )}
        {/* Members */}
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white">
            <Users className="h-4 w-4" aria-hidden />
            {club.memberCount}/{club.maxSeats} members
          </span>
        </div>
      </div>
    </div>
  );
}
