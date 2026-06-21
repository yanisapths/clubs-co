import { Club } from "@/features/studio/api/club";
import { MapPin } from "lucide-react";
import { SocialIcon } from "./social-icons";
import { Tag } from "@/features/shared/components/tag";

export function ClubDetailsTab({ club }: { club: Club }) {
  const MAX_TAGS = 5;
  const MAX_SPACES = 4;
  const visibleTags = (club.tags ?? []).slice(0, MAX_TAGS);
  const extraTags = Math.max(0, (club.tags ?? []).length - MAX_TAGS);
  const visibleSpaces = (club.spaces ?? []).slice(0, MAX_SPACES);
  const extraSpaces = Math.max(0, (club.spaces ?? []).length - MAX_SPACES);

  const normalisedLinks = (club.socialLinks ?? []).map((link) => {
    if ("platform" in link && "url" in link) {
      return { platform: link.platform as string, url: link.url as string };
    }
    const [platform, url] = Object.entries(link)[0] ?? [];
    return { platform, url };
  });

  return (
    <div className="px-6 py-6 space-y-6">
      {/* About */}
      <div>
        <p className="text-sm text-white/50 mb-2">About this club</p>
        <p className="text-white/80 leading-relaxed whitespace-pre-line line-clamp-3 max-w-[800px]">
          {club.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {normalisedLinks.length > 0 && (
            <>
              <p className="text-sm text-white/50">Social media</p>
              <div className="flex items-center gap-4 pt-1">
                {normalisedLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap justify-end items-center gap-2">
              {visibleTags.map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
              {extraTags > 0 && (
                <span className="text-sm text-white/40">+{extraTags} more</span>
              )}
            </div>
          )}

          {visibleSpaces.length > 0 && (
            <div className="flex flex-wrap justify-end items-center gap-x-4 gap-y-1">
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
                <span className="text-sm text-white/40">
                  +{extraSpaces} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 text-xs"
            >
              photo {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
