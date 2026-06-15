import { Users, MapPin } from "lucide-react";
import { ClubFormData } from "./types";

interface ClubPreviewCardProps {
  data: ClubFormData;
}

export function ClubPreviewCard({ data }: ClubPreviewCardProps) {
  if (!data.name && !data.description) return null;

  const visibleSpaces = data.spaces.slice(0, 2);
  const extraSpaces = data.spaces.length - visibleSpaces.length;

  const visibleTags = data.tags.slice(0, 3);
  const extraTags = data.tags.length - visibleTags.length;

  return (
    <div className="mt-5 max-w-[450px]">
      {data.name && (
        <p className="text-xl font-semibold leading-tight text-white line-clamp-2">
          {data.name}
        </p>
      )}

      {data.description && (
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-zinc-400">
          {data.description}
        </p>
      )}

      {data.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-sm text-white/60"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-sm text-white/60">+{extraTags} more</span>
          )}
        </div>
      )}

      {data.spaces.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-zinc-400">
          {visibleSpaces.map((space) => (
            <span key={space.id} className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {space.location}
            </span>
          ))}
          {extraSpaces > 0 && <span>+{extraSpaces} more</span>}
        </div>
      )}

      <div className="mt-2">
        <span className="flex w-fit items-center gap-2 rounded-sm bg-black px-2.5 py-1 text-sm text-white">
          <Users className="h-4 w-4" aria-hidden="true" />
          142 members
        </span>
      </div>
    </div>
  );
}
