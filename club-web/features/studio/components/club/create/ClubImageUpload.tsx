"use client";

import { useRef, useState } from "react";
import { Info, Upload, X } from "lucide-react";
import { categories } from "@/features/shared/constants";

type Category = (typeof categories)[number];

interface ClubImageUploadProps {
  imagePreview: string | null;
  onImageChange: (file: File | null, preview: string | null) => void;
  badge: string;
  category?: Category;
  className?: string;
}

const ACCEPTED_TYPES = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
];
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export function ClubImageUpload({
  imagePreview,
  onImageChange,
  badge,
  className = "",
  category,
}: ClubImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("File must be GIF, JPG, PNG, or SVG");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("File must be 50 MB or smaller");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    onImageChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-semibold text-white">Club Image</h4>
        <Info className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex aspect-square w-full max-w-[400px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors ${
          isDragging
            ? "border-zinc-500 bg-zinc-900/80"
            : "border-zinc-700 bg-zinc-950/40 hover:border-zinc-600"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {imagePreview ? (
          <>
            <img
              src={imagePreview}
              alt="Club image preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-300">
              <Upload className="h-4 w-4" />
            </span>
            <p className="text-sm text-zinc-300">
              <span className="text-sky-400">Click to upload</span> or drag and
              drop
            </p>
            <p className="font-mono text-xs tracking-wide text-zinc-500">
              1000 x 1000 &middot; GIF, JPG, PNG, SVG, max 50 MB
            </p>
          </div>
        )}

        {badge && (
          <span
            className={`absolute right-6 top-6 rounded-full px-3 py-2 text-xs font-medium ${
              badge === "Public"
                ? "bg-[#97FFFF] text-[#248582] border border-[#00D0FF]/20"
                : badge === "Private"
                  ? "bg-[#A6ADFF] text-[#3F42E1] border border-[#2200FF]/20"
                  : "bg-zinc-300 text-zinc-900"
            }`}
          >
            {badge}
          </span>
        )}

        {category && (
          <span className="absolute left-4 bottom-4 rounded-full px-3 py-2 text-sm font-medium bg-black/40 backdrop-blur text-white/80 border border-white/40">
            <div className="flex gap-1 items-center justify-center">
              {category.icon} {category.category}
            </div>
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
