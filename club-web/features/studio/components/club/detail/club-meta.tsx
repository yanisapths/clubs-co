import { getGradient } from "@/features/shared/components/avatar";
import { Tag } from "@/features/shared/components/tag";
import { categories } from "@/features/shared/constants";
import { Club } from "@/features/studio/api/club";
import { formatUnixDate } from "@/lib/utils";
import { Edit3Icon } from "lucide-react";

export function ClubBanner({
  club,
  isOwner,
  onEdit,
}: {
  club: Club;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const [from, to] = getGradient(String(club.id));
  const categoryDef = categories.find((c) => c.id === club.category?.id);

  return (
    <div
      className="relative h-56 w-full z-0 blur-3xl opacity-90 overflow-hidden rounded-none lg:rounded-xl"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
        <h1 className="text-5xl font-bold text-white/20 tracking-tight">
          {club.name}
        </h1>
      </div>

      {categoryDef && (
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur">
          {categoryDef.icon}
          {categoryDef.category}
        </span>
      )}
      {isOwner && (
        <button
          onClick={onEdit}
          className="cursor-pointer absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-sm text-white/70 backdrop-blur hover:bg-white/10 transition-colors"
        >
          <Edit3Icon className="h-3.5 w-3.5" />
          edit a club
        </button>
      )}
    </div>
  );
}

export function ClubMeta({ club }: { club: Club }) {
  return (
    <div className="flex flex-col gap-3 px-6 pt-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-xl bg-white/10 border border-white/15 overflow-hidden">
          {club.imageUrl ? (
            <img
              src={club.imageUrl}
              alt={club.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal-400 to-sky-300" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{club.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Tag>By {club.owner}</Tag>
            <Tag>Est. {formatUnixDate(club.createdAt)}</Tag>
            <div className="flex gap-1 items-center text-[#53FF84]">
              <span className="h-2 w-2 rounded-full bg-[#53FF84]" />
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 text-right">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Type</p>
          <p className="mt-0.5 text-white">{club.clubType}</p>
        </div>
        {/* ⚠️ eventCount not yet in API — replace 0 with club.eventCount */}
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">
            Events
          </p>
          <p className="mt-0.5 font-semibold text-white">—</p>
        </div>
        {/* ⚠️ memberCount not yet in API — replace with club.memberCount */}
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">
            Members
          </p>
          <p className="mt-0.5 font-semibold text-white">—</p>
        </div>
      </div>
    </div>
  );
}
