"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { InviteInfo } from "@/features/membership/api/club";

interface InviteLetterModalProps {
  open: boolean;
  onClose: () => void;
  clubName: string;
  recipientName: string;
  invite: InviteInfo;
  onAccept: () => void;
  onDecline: () => void;
  pendingAction: "accept" | "decline" | null;
  error?: string | null;
}

const roleLabel: Record<string, string> = {
  CoFounder: "co-founder",
  Member: "club member",
};

function formatInviteDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(unixSeconds * 1000));
}

export function InviteLetterCard({
  open,
  onClose,
  clubName,
  recipientName,
  invite,
  onAccept,
  onDecline,
  pendingAction,
  error,
}: InviteLetterModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-[460px] rounded-2xl overflow-hidden"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
            }}
          >
            <div className="border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-white">
                    Welcome to {clubName}
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    You&rsquo;ve been invited!
                  </p>{" "}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-white">
                  Dear, {recipientName}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatInviteDate(invite.invitedAt)}
                </p>
              </div>

              <p className="mt-4 text-center text-md leading-relaxed text-zinc-300">
                We&rsquo;re delighted to invite you to be a
                <span className="text-pink-400 pl-1">
                  {roleLabel[invite.invitedAs] ??
                    invite.invitedAs.toLowerCase()}
                </span>
                . <br />
                We&rsquo;re looking forward to seeing you in the club!
              </p>

              <div className="mt-6 text-right">
                <p className="text-xs text-zinc-500">
                  From founder & co-founders
                </p>
                <p className="text-sm font-medium text-white">
                  {invite.inviterDisplayName}
                </p>
                <p className="text-xs text-zinc-500">
                  @{invite.inviterUsername}
                </p>
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <div className="mt-6 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={onDecline}
                  disabled={pendingAction !== null}
                  className="cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === "decline" ? "Declining…" : "Decline"}
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={pendingAction !== null}
                  className="cursor-pointer rounded-full bg-[#FFB7F9] px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === "accept"
                    ? "Joining…"
                    : "Accept and Join now"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
