"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/design-system/components/button";
import { UserInfo } from "@/hooks/use-account-auth";
import { useDeleteUser } from "@/features/studio/hooks/use-profile";
import { toast } from "@heroui/react";

export function AccountSettingTab() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        toast.success("Your account has been deleted.");
        router.push("/");
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
                isDisabled={deleteUser.isPending}
                className="cursor-pointer rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                isDisabled={deleteUser.isPending}
                className="cursor-pointer rounded-lg bg-[#FF0000] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#FF0000]/60 active:bg-[#FF0000] disabled:opacity-50"
              >
                {deleteUser.isPending ? "Deleting…" : "Confirm"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
