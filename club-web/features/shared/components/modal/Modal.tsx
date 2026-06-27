"use client";

import clsx from "clsx";
import { X, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md";
}

export function ModalShell({
  onClose,
  children,
  size = "md",
}: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={clsx("w-full rounded-2xl overflow-hidden flex flex-col", {
          "max-w-[600px]": size == "sm",
          "max-w-[900px]": size == "md",
        })}
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 80px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── ModalHeader ──────────────────────────────────────────────────────────────

interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose: () => void;
}

export function ModalHeader({ title, description, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── ModalBody ────────────────────────────────────────────────────────────────

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto p-6 ${className}`}>{children}</div>
  );
}

interface ModalFooterProps {
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  isSaving?: boolean;
  isSaveDisabled?: boolean;
  aside?: ReactNode;
}

export function ModalFooter({
  onClose,
  onSave,
  saveLabel = "Save",
  isSaving = false,
  isSaveDisabled = false,
  aside,
}: ModalFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
      <div className="text-sm text-zinc-500">{aside}</div>
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
          onClick={onSave}
          disabled={isSaveDisabled || isSaving}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isSaving ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
