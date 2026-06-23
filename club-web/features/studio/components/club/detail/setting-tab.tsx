import { Club } from "@/features/studio/api/club";
import { useDeleteClub } from "@/features/studio/hooks/use-club";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToggleSwitch } from "../create/toggle-switch";
import { Button } from "@/design-system/components/button";

interface SettingTabProps {
  username: string;
  club: Club;
}

export function SettingTab({ username, club }: SettingTabProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteClub = useDeleteClub();

  const handleDelete = () => {
    deleteClub.mutate(club.id, {
      onSuccess: () => {
        router.push(`/${username}/studio/club`);
      },
    });
  };

  return (
    <div className="mx-auto w-4xl space-y-4 m-auto py-20 mt-10">
      <div className="rounded-2xl bg-zinc-900 px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold text-white/80">
              Deactivate this club
            </h3>
            <p className="mt-1 text-sm text-white/60 w-[450px]">
              Deactivating is temporary, and it means your club will be hidden
              from public view on Clubspace until you reactivate it.
            </p>
          </div>
          <ToggleSwitch
            checked={false}
            onChange={() => {}}
            label="Deactivate club"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold text-red-500">
              Delete this club
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Once you delete a club, there is no going back. Please be certain.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="cursor-pointer shrink-0 rounded-lg border-[#FF0000]/20 hover:bg-[#FF0000]/5 bg-[#FF0000]/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#FF0000] transition"
            >
              Delete
            </Button>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                isDisabled={deleteClub.isPending}
                className="cursor-pointer rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                isDisabled={deleteClub.isPending}
                className="cursor-pointer rounded-lg bg-[#FF0000] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#FF0000]/60 active:bg-[#FF0000] disabled:opacity-50"
              >
                {deleteClub.isPending ? "Deleting…" : "Confirm"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
