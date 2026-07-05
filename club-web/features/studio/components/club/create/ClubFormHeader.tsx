import { ChevronLeft } from "lucide-react";
interface ClubFormHeaderProps {
  onBack?: () => void;
  isEdit?: boolean;
  clubName?: string;
}

export function ClubFormHeader({
  onBack,
  isEdit = false,
  clubName,
}: ClubFormHeaderProps) {
  return (
    <header className="border-b border-zinc-800 py-4 px-4 sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex sm:text-xl text-zinc-400">
          creator studio <span className="mx-2 text-zinc-600">/</span>
          {isEdit ? (
            <div onClick={onBack} className="flex">
              <p className="hover:text-white cursor-pointer max-w-16 sm:w-full sm:max-w-full truncate text-ellipsis">
                {clubName}
              </p>
              <div className="mx-2"> / </div>
            </div>
          ) : null}
          <span className="text-white">{`${isEdit ? "edit" : "create a club"}`}</span>
        </div>
      </div>
    </header>
  );
}
