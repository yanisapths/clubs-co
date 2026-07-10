import Image from "next/image";
import clsx from "clsx";
import { getCategoryGradient } from "./constants";

const gradientMap: Record<string, string> = {
  sports: "linear-gradient(160deg,#4a5a1a 0%,#7a8a2a 45%,#b8aa30 100%)",
  art: "linear-gradient(160deg,#5a1a2a 0%,#8a2a4a 45%,#aa3a6a 100%)",
  culture: "linear-gradient(160deg,#4a2a1a 0%,#7a4a2a 45%,#aa6a3a 100%)",
  esport: "linear-gradient(160deg,#2a1a5a 0%,#4a2a8a 45%,#6a3aaa 100%)",
  education: "linear-gradient(160deg,#1a5a3a 0%,#2a8a5a 45%,#3aaa7a 100%)",
  tech: "linear-gradient(160deg,#0a1a2a 0%,#1a3a5a 45%,#2a5a8a 100%)",
  other: "linear-gradient(160deg,#1a1a2a 0%,#2a2a4a 45%,#4a3a6a 100%)",
};

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
