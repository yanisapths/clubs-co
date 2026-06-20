import { Users, MapPin } from "lucide-react";
import { type Club } from "../../api/club";
import { categories } from "@/features/shared/constants";
import Image from "next/image";

interface ClubCardProps {
  club: Club;
  onClick?: () => void;
}

export function ClubCard({ club, onClick }: ClubCardProps) {
  const visibleTags = club.tags.slice(0, 3);
  const extraTags = club.tags.length - visibleTags.length;

  const visibleSpaces = club.spaceIds.slice(0, 2);
  const extraSpaces = club.spaceIds.length - visibleSpaces.length;

  const category = categories.find((c) => c.category === club.categoryName);

  const gradientMap: Record<string, string> = {
    sports: "linear-gradient(160deg, #4a5a1a 0%, #7a8a2a 40%, #b8aa30 100%)",
    art: "linear-gradient(160deg, #5a1a2a 0%, #8a2a4a 40%, #aa3a6a 100%)",
    culture: "linear-gradient(160deg, #4a2a1a 0%, #7a4a2a 40%, #aa6a3a 100%)",
    esport: "linear-gradient(160deg, #2a1a5a 0%, #4a2a8a 40%, #6a3aaa 100%)",
    education: "linear-gradient(160deg, #1a5a3a 0%, #2a8a5a 40%, #3aaa7a 100%)",
    tech: "linear-gradient(160deg, #0a1a2a 0%, #1a3a5a 40%, #2a5a8a 100%)",
    other: "linear-gradient(160deg, #1a1a2a 0%, #2a2a4a 40%, #4a3a6a 100%)",
  };

  const gradient = gradientMap[category?.colorVariant ?? "other"];

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
        style={{ background: gradient }}
      >
        {club.imageUrl ? (
          <Image
            src={club.imageUrl}
            alt={club.name}
            fill
            className="absolute inset-0 h-auto w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center select-none">
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "rgba(255,220,180,0.5)" }}
            >
              {club.categoryName}
            </p>

            <p className="mt-1 text-2xl font-black uppercase tracking-wide text-white/70 line-clamp-3 leading-tight">
              {club.name}
            </p>
          </div>
        )}

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold ${badgeStyle}`}
        >
          {club.clubType}
        </span>

        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white/80 border border-white/20 backdrop-blur-sm">
          {category?.icon}
          {club.categoryName}
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
        {club.spaceIds.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {visibleSpaces.map((id) => (
              <span
                key={id}
                className="flex items-center gap-1 text-sm text-white/40"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Space {id}
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
            {club.maxSeats} members
          </span>
        </div>
      </div>
    </div>
  );
}
