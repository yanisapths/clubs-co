import { getGradient } from "@/features/studio/utils/utils";

function initialsOf(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

interface ClubThumbnailProps {
  id: string | number;
  name: string;
  imageUrl?: string | null;
  size?: number;
  rounded?: string;
  className?: string;
}

export function ClubThumbnail({
  id,
  name,
  imageUrl,
  size = 44,
  rounded = "rounded-xl",
  className = "",
}: ClubThumbnailProps) {
  const [from, to] = getGradient(String(id));

  return (
    <div
      className={`${rounded} shrink-0 flex items-center justify-center text-[11px] font-black text-white/70 uppercase tracking-widest ${className}`}
      style={{
        width: size,
        height: size,
        background: imageUrl
          ? `url(${imageUrl}) center/cover`
          : `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {!imageUrl && initialsOf(name)}
    </div>
  );
}
