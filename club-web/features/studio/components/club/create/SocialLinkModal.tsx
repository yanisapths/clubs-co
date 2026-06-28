"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { ALL_PLATFORMS, PLATFORM_CONFIG } from "@/features/shared/constants";
import { SocialLink, SocialPlatform } from "@/features/studio/api/common";

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:";
  } catch {
    return false;
  }
}

interface SocialLinksModalProps {
  links: SocialLink[];
  onSave: (links: SocialLink[]) => void;
  onClose: () => void;
}

export function SocialLinksModal({
  links,
  onSave,
  onClose,
}: SocialLinksModalProps) {
  const initialValues = Object.fromEntries(
    ALL_PLATFORMS.map((p) => {
      const apiKey = PLATFORM_CONFIG[p].apiKey;
      const match = links.find((l) => apiKey in l);
      return [p, match ? (match[apiKey] ?? "") : ""];
    }),
  ) as Record<SocialPlatform, string>;

  const [values, setValues] =
    useState<Record<SocialPlatform, string>>(initialValues);
  const [touched, setTouched] = useState<Record<SocialPlatform, boolean>>(
    Object.fromEntries(ALL_PLATFORMS.map((p) => [p, false])) as Record<
      SocialPlatform,
      boolean
    >,
  );

  const errors = Object.fromEntries(
    ALL_PLATFORMS.map((p) => [p, !isValidUrl(values[p])]),
  ) as Record<SocialPlatform, boolean>;

  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (platform: SocialPlatform, url: string) =>
    setValues((prev) => ({ ...prev, [platform]: url }));

  const handleBlur = (platform: SocialPlatform) =>
    setTouched((prev) => ({ ...prev, [platform]: true }));

  const handleClear = (platform: SocialPlatform) => {
    setValues((prev) => ({ ...prev, [platform]: "" }));
    setTouched((prev) => ({ ...prev, [platform]: false }));
  };

  const handleSave = () => {
    setTouched(
      Object.fromEntries(ALL_PLATFORMS.map((p) => [p, true])) as Record<
        SocialPlatform,
        boolean
      >,
    );
    if (hasErrors) return;

    const result: SocialLink[] = ALL_PLATFORMS.filter(
      (p) => values[p].trim() !== "",
    ).map((p) => ({ [PLATFORM_CONFIG[p].apiKey]: values[p].trim() }));

    onSave(result);
    onClose();
  };
  const filledCount = ALL_PLATFORMS.filter((p) => values[p].trim()).length;

  return (
    <div
      className="fixed h-full inset-0 z-50 flex items-center justify-center px-4 place-content-center"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">Social links</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Connect your club to the wider web.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-6">
          {ALL_PLATFORMS.map((platformKey) => {
            const config = PLATFORM_CONFIG[platformKey];
            const hasError = touched[platformKey] && errors[platformKey];
            const isFilled = values[platformKey].trim() !== "";

            return (
              <div key={platformKey}>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                    hasError
                      ? "border-red-500/50 bg-zinc-900"
                      : isFilled
                        ? "border-zinc-600 bg-zinc-900"
                        : "border-zinc-700 bg-zinc-900 focus-within:border-zinc-500"
                  }`}
                >
                  <div className="flex shrink-0 items-center gap-2 text-zinc-400">
                    <config.Icon className="h-4 w-4" />
                    <span className="w-[72px] text-sm font-medium text-zinc-300">
                      {config.label}
                    </span>
                  </div>

                  <div className="h-4 w-px shrink-0 bg-zinc-700" />

                  <input
                    type="url"
                    value={values[platformKey]}
                    onChange={(e) => handleChange(platformKey, e.target.value)}
                    onBlur={() => handleBlur(platformKey)}
                    placeholder={config.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                  />

                  {isFilled && (
                    <button
                      type="button"
                      onClick={() => handleClear(platformKey)}
                      aria-label={`Clear ${config.label}`}
                      className="cursor-pointer flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {hasError && (
                  <p className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Enter a valid URL starting with https://
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
          <span className="text-sm text-zinc-500">
            {filledCount === 0
              ? "No links added"
              : `${filledCount} link${filledCount !== 1 ? "s" : ""} added`}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={hasErrors}
              className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save links
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
