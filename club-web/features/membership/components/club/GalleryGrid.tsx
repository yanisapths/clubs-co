import { Plus } from "lucide-react";

const TOTAL_SLOTS = 4;

export function GalleryGrid({
  galleryUrls,
  onAddClick,
  onImageClick,
}: {
  galleryUrls: string[];
  onAddClick: () => void;
  onImageClick: (index: number) => void;
}) {
  const hasOverflow = galleryUrls.length > TOTAL_SLOTS;
  // When overflow: show 3 images + overflow slot; otherwise show up to 4
  const visibleUrls = galleryUrls.slice(
    0,
    hasOverflow ? TOTAL_SLOTS - 1 : TOTAL_SLOTS,
  );
  const remaining = galleryUrls.length - (TOTAL_SLOTS - 1);
  const fourthImage = galleryUrls[TOTAL_SLOTS - 1];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {visibleUrls.map((url, i) => (
        <div
          key={url}
          className="relative aspect-video overflow-hidden rounded-xl border border-white/10 cursor-pointer group"
          onClick={() => onImageClick(i)}
        >
          <img
            src={url}
            alt={`Gallery image ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        </div>
      ))}

      {hasOverflow ? (
        <div
          onClick={() => onImageClick(TOTAL_SLOTS - 1)}
          className="relative aspect-video overflow-hidden rounded-xl border border-white/10 cursor-pointer group"
        >
          <img
            src={fourthImage}
            alt="Gallery image 4"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              +{remaining} more
            </span>
          </div>
        </div>
      ) : galleryUrls.length < TOTAL_SLOTS ? (
        <div
          onClick={onAddClick}
          className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
          <Plus className="w-5 h-5 text-white/40" />
        </div>
      ) : null}
    </div>
  );
}
