"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/design-system/components/button";
import { useDeleteUser } from "@/features/studio/hooks/use-profile";
import { toast } from "@heroui/react";
import { clearStoredToken } from "@/lib/storage";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { ConfirmationModal } from "@/features/shared/components/modal/ConfirmationModal";
import { useModal } from "@/hooks/use-modal";

export function AccountSettingTab() {
  const router = useRouter();
  const { logout } = useAccountAuth();
  const { show, visible, close } = useModal();
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        logout();
        toast.success("Your account has been deleted.");
        clearStoredToken();
        router.replace("/");
      },
      onError: (error) => {
        toast.danger(
          error instanceof Error
            ? error.message
            : "Failed to delete your account.",
        );
      },
    });
  };

  return (
    <div>
      <div className="mx-auto w-4xl space-y-4 m-auto py-20 mt-10">
        <div className="rounded-2xl bg-zinc-900 px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col justify-start text-left">
              <h3 className="text-base font-semibold text-red-500">
                Delete this account
              </h3>
              <p className="mt-1 text-sm text-white/60 w-[450px]">
                Once you delete an account, there is no going back.
                <br />
                All clubs owned by you will also be removed. Please be certain.
              </p>
            </div>

            <Button
              onClick={show}
              variant="outline"
              className="cursor-pointer shrink-0 rounded-lg border-[#FF0000]/20 hover:bg-[#FF0000]/5 bg-[#FF0000]/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#FF0000] transition"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      {visible && (
        <ConfirmationModal
          title="Delete this account"
          description="This will permanently delete the account and remove all associations. All clubs owned by you will also be removed."
          confirmationPhrase="delete"
          actionLabel="Delete this account"
          isPending={deleteUser.isPending}
          onConfirm={handleDelete}
          onClose={close}
          variant="danger"
        />
      )}
    </div>
  );
}
