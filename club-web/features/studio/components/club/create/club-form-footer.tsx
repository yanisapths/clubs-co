interface ClubFormFooterProps {
  onCancel: () => void;
  onCreate: () => void;
  isCreating?: boolean;
  isValid?: boolean;
}

export function ClubFormFooter({
  onCancel,
  onCreate,
  isCreating = false,
  isValid = false,
}: ClubFormFooterProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-3 border-t border-zinc-800 bg-black/80 px-6 py-4 backdrop-blur sm:px-12">
      <button
        type="button"
        onClick={onCancel}
        className="cursor-pointer rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:border-zinc-600"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onCreate}
        disabled={isCreating || !isValid}
        className="cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
