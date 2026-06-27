"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  ModalShell,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/features/shared/components/modal";
import { FormInput } from "@/features/shared/components/input/FormInput";

interface ConfirmationModalProps {
  title: string;
  description?: string;
  /**
   * When provided, the user must type this exact string before the
   * confirm button becomes active. Pass `undefined` to skip the input step.
   */
  confirmationPhrase?: string;
  /** Label shown inside the input field hint. Defaults to confirmationPhrase. */
  confirmationInputLabel?: string;
  /** Label on the destructive action button. */
  actionLabel?: string;
  /** Set to true to show a spinner and disable buttons during the async action. */
  isPending?: boolean;
  /** Called when the user confirms. */
  onConfirm: () => void;
  onClose: () => void;
  /** Variant controls the accent color of the action button. */
  variant?: "danger" | "default";
}

export function ConfirmationModal({
  title,
  description,
  confirmationPhrase,
  confirmationInputLabel,
  actionLabel = "Confirm",
  isPending = false,
  onConfirm,
  onClose,
  variant = "danger",
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("");

  const phraseMatches =
    !confirmationPhrase ||
    inputValue.trim().toLowerCase() === confirmationPhrase.toLowerCase();

  const isDisabled = isPending || !phraseMatches;

  const actionButtonClass =
    variant === "danger"
      ? "flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      : "flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <ModalShell onClose={onClose} size="sm">
      <ModalHeader title={title} onClose={onClose} />

      <ModalBody className="flex flex-col gap-5">
        <div className="flex items-start text-left gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300  max-w-[470px]">
            {description ??
              "This action is permanent and cannot be undone. Please proceed with caution."}
          </p>
        </div>

        {confirmationPhrase && (
          <div className="flex flex-col gap-1.5 text-center">
            <p className="text-sm text-zinc-400">
              To confirm, type{" "}
              <span className="font-mono font-semibold text-white">
                &ldquo;{confirmationPhrase}&rdquo;
              </span>{" "}
              below.
            </p>
            <FormInput
              id="confirmation-phrase"
              value={inputValue}
              onChange={setInputValue}
              placeholder={confirmationPhrase}
            />
          </div>
        )}
      </ModalBody>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDisabled}
          className={actionButtonClass}
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? "Please wait…" : actionLabel}
        </button>
      </div>
    </ModalShell>
  );
}
