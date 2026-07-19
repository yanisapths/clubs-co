"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  imageUrl?: string | null;
  displayName: string;
  className?: string;
  size?: number;
}

export function Avatar({
  displayName,
  imageUrl,
  className,
  size = 24,
}: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={displayName}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-black text-center font-semibold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        boxShadow:
          "inset 0 0 16px 6px rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <p className="relative z-10 flex justify-center">{displayName[0]}</p>
    </div>
  );
}
