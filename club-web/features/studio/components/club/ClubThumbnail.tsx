import Image from "next/image";
import clsx from "clsx";
import { getCategoryGradient } from "./constants";

interface ClubThumbnailProps {
  imageUrl?: string | null;
  name: string;
  category?: string;
  colorVariant?: string;
  size?: "video" | "square";
  className?: string;
}

export function ClubThumbnail({
  imageUrl,
  name,
  category,
  colorVariant = "other",
  size = "video",
  className,
}: ClubThumbnailProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden",
        size === "video"
          ? "aspect-video rounded-2xl"
          : "aspect-square rounded-xl",
        className,
      )}
      style={{ background: getCategoryGradient(category ? category : "other") }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.18),transparent_40%)]" />

          {size == "video" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center select-none">
              <p
                className={clsx(
                  "font-black uppercase tracking-[0.2em]",
                  size === "video" ? "text-xs" : "text-[10px]",
                )}
                style={{ color: "rgba(255,230,200,.45)" }}
              >
                {category}
              </p>

              <h3
                className={clsx(
                  "mt-2 font-black uppercase text-white/70 leading-tight",
                  size === "video"
                    ? "text-2xl line-clamp-3"
                    : "text-sm line-clamp-2",
                )}
              >
                {name}
              </h3>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center select-none">
              <p className="text-3xl font-black uppercase text-white/70 leading-tight">
                {name.charAt(0)}
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </>
      )}
    </div>
  );
}
