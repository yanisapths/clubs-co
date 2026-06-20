/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { X, Globe, AlertCircle } from "lucide-react";
import { SocialLink, SocialPlatform } from "./types";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  iconColor: string;
}[] = [
  {
    id: "Website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    icon: <Globe className="h-4 w-4" />,
    iconColor: "text-zinc-400",
  },
  {
    id: "X",
    label: "X",
    placeholder: "https://x.com/yourhandle",
    icon: <XIcon className="h-4 w-4" />,
    iconColor: "text-zinc-100",
  },
  {
    id: "Meta",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    icon: <MetaIcon className="h-4 w-4" />,
    iconColor: "text-[#1877F2]",
  },
  {
    id: "Instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    icon: <InstagramIcon className="h-4 w-4" />,
    iconColor: "text-[#E1306C]",
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true; // optional fields
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
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
    PLATFORMS.map((p) => [
      p.id,
      links.find((l) => l.platform === p.id)?.url ?? "",
    ]),
  ) as Record<SocialPlatform, string>;

  const [values, setValues] =
    useState<Record<SocialPlatform, string>>(initialValues);

  const [touched, setTouched] = useState<Record<SocialPlatform, boolean>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.id, false])) as Record<
      SocialPlatform,
      boolean
    >,
  );

  const errors = Object.fromEntries(
    PLATFORMS.map((p) => [p.id, !isValidUrl(values[p.id])]),
  ) as Record<SocialPlatform, boolean>;

  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (platform: SocialPlatform, url: string) => {
    setValues((prev) => ({ ...prev, [platform]: url }));
  };

  const handleBlur = (platform: SocialPlatform) => {
    setTouched((prev) => ({ ...prev, [platform]: true }));
  };

  const handleClear = (platform: SocialPlatform) => {
    setValues((prev) => ({ ...prev, [platform]: "" }));
    setTouched((prev) => ({ ...prev, [platform]: false }));
  };

  const handleSave = () => {
    setTouched(
      Object.fromEntries(PLATFORMS.map((p) => [p.id, true])) as Record<
        SocialPlatform,
        boolean
      >,
    );
    if (hasErrors) return;

    const result: SocialLink[] = PLATFORMS.filter(
      (p) => values[p.id].trim() !== "",
    ).map((p) => ({
      id: links.find((l) => l.platform === p.id)?.id ?? crypto.randomUUID(),
      platform: p.id,
      url: values[p.id].trim(),
    }));

    onSave(result);
    onClose();
  };

  const filledCount = PLATFORMS.filter((p) => values[p.id].trim()).length;

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

        {/* Fields */}
        <div className="flex flex-col gap-3 p-6">
          {PLATFORMS.map((platform) => {
            const hasError = touched[platform.id] && errors[platform.id];
            const isFilled = values[platform.id].trim() !== "";

            return (
              <div key={platform.id}>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
                    hasError
                      ? "border-red-500/50 bg-zinc-900"
                      : isFilled
                        ? "border-zinc-600 bg-zinc-900"
                        : "border-zinc-700 bg-zinc-900 focus-within:border-zinc-500"
                  }`}
                >
                  {/* Icon + label */}
                  <div
                    className={`flex shrink-0 items-center gap-2 ${platform.iconColor}`}
                  >
                    {platform.icon}
                    <span className="w-[72px] text-sm font-medium text-zinc-300">
                      {platform.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-4 w-px shrink-0 bg-zinc-700" />

                  {/* URL input */}
                  <input
                    type="url"
                    value={values[platform.id]}
                    onChange={(e) => handleChange(platform.id, e.target.value)}
                    onBlur={() => handleBlur(platform.id)}
                    placeholder={platform.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                  />

                  {/* Clear button */}
                  {isFilled && (
                    <button
                      type="button"
                      onClick={() => handleClear(platform.id)}
                      aria-label={`Clear ${platform.label}`}
                      className="cursor-pointer flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {hasError && (
                  <p className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
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
