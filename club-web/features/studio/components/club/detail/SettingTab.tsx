import { Club } from "@/features/studio/api/club";
import { useDeleteClub, usePatchClub } from "@/features/studio/hooks/use-club";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToggleSwitch } from "../create/ToggleSwitch";
import { Button } from "@/design-system/components/button";
import { ConfirmationModal } from "@/features/shared/components/modal/ConfirmationModal";
import { useModal } from "@/hooks/use-modal";
import { toast } from "@heroui/react";

interface SettingTabProps {
  username: string;
  club: Club;
}

export function SettingTab({ username, club }: SettingTabProps) {
  const router = useRouter();
  const { show, visible, close } = useModal();
  const deleteClub = useDeleteClub();
  const patchClub = usePatchClub(club.id);
  const [isActive, setIsActive] = useState(club.activate);

  const handleDelete = () => {
    deleteClub.mutate(club.id, {
      onSuccess: () => {
        router.push(`/${username}/studio/club`);
      },
    });
  };

  const handleActivation = () => {
    const nextActive = !isActive;

    patchClub.mutate(
      { activate: nextActive },
      {
        onSuccess: () => {
          setIsActive(nextActive);
        },
        onError: () => {
          if (nextActive) {
            toast.danger("Failed to activate club. Please try again.");
          } else {
            toast.danger("Failed to deactivate club. Please try again.");
          }
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 sm:px-6 md:px-0 py-10 mb-8 sm:py-16 md:py-20 sm:mt-10">
      <div className="rounded-2xl bg-zinc-900 px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div>
            <h3 className="text-base font-semibold text-white/80">
              Deactivate this club
            </h3>
            <p className="mt-1 text-sm text-white/60 max-w-full sm:max-w-[450px]">
              Deactivating is temporary, and it means your club will be hidden
              from public view on Meeteon until you reactivate it.
            </p>
          </div>
          <div className="shrink-0">
            <ToggleSwitch
              checked={!isActive}
              onChange={handleActivation}
              label="Deactivate club"
              disabled={patchClub.isPending}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div>
            <h3 className="text-base font-semibold text-red-500">
              Delete this club
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Once you delete a club, there is no going back. Please be certain.
            </p>
          </div>

          <Button
            onClick={show}
            variant="outline"
            className="cursor-pointer w-full sm:w-auto shrink-0 rounded-lg border-[#FF0000]/20 hover:bg-[#FF0000]/5 bg-[#FF0000]/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#FF0000] transition"
          >
            Delete
          </Button>
        </div>
      </div>

      {visible && (
        <ConfirmationModal
          title="Delete this club"
          description="This will permanently delete the club, members and remove all associations. Once you delete a club, there is no going back."
          confirmationPhrase="delete"
          actionLabel="Delete this club"
          isPending={deleteClub.isPending}
          onConfirm={handleDelete}
          onClose={close}
          variant="danger"
        />
      )}
    </div>
  );
}
