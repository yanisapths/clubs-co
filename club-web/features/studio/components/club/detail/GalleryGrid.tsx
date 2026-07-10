import { Plus } from "lucide-react";
import { Button } from "@/design-system/components";

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
  const visibleUrls = galleryUrls.slice(0, TOTAL_SLOTS - 1);
  const emptySlots = TOTAL_SLOTS - 1 - visibleUrls.length;
  const fourthImage = galleryUrls[TOTAL_SLOTS - 1];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pb-12">
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

      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/10"
        />
      ))}

      <div
        onClick={onAddClick}
        className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer group transition-all"
      >
        {fourthImage ? (
          <>
            <img
              src={fourthImage}
              alt="Gallery image 4"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/80 group-hover:bg-black/70 transition-colors" />
          </>
        ) : (
          <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
        )}

        <div className="cursor-pointer relative z-10 flex flex-col items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors">
          <Plus className="h-5 w-5" />
          <span className="text-xs">Add more images</span>
        </div>
      </div>
    </div>
  );
}

interface GalleryEmptyStateProps {
  onAddClick?: VoidFunction;
  isMember?: boolean;
}
export function GalleryEmptyState({
  onAddClick,
  isMember,
}: GalleryEmptyStateProps) {
  return (
    <div className="relative flex flex-col justify-center place-content-center mx-auto w-full text-center mb-20 sm:mb-0">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pb-16">
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 bottom-0 h-60 w-full z-10 bg-gradient-to-t from-black to-transparent transition-opacity duration-200" />
      {isMember ? (
        <div className="absolute z-50 inset-0 top-2 text-center mt-10">
          <div className="flex flex-col w-full items-center gap-4">
            <div className="flex -space-x-6">
              <div className="h-32 w-24 rotate-[-8deg] rounded-xl bg-sky-200" />
              <div className="h-32 w-24 rounded-xl bg-rose-300" />
              <div className="h-32 w-24 rotate-[8deg] rounded-xl bg-zinc-700" />
            </div>
            <h2 className="text-white mt-2 text-3xl font-bold text-center">
              No featured galleries
            </h2>
            <p className="max-w-sm text-white/50">
              This club hasn&apos;t added any galleries yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute z-20 inset-0 top-20">
          <div className="flex flex-col w-full items-center gap-4">
            <h2 className="text-2xl font-bold">Featured galleries</h2>
            <Button
              onClick={onAddClick}
              className="rounded-md border border-white/30 bg-black/80 py-4 px-6 text-white/90 hover:bg-white/10 backdrop-blur-md"
            >
              Add gallery
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
