/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatUnixDate } from "@/lib/utils";
import { Button, toast } from "@heroui/react";
import {
  UserPlus,
  MoreHorizontal,
  LogOut,
  Check,
  X,
  UserX,
  InfoIcon,
} from "lucide-react";
import { useState } from "react";
import { ClubMember, MemberAvatar } from "./MemberAvatar";
import { NOW_SECONDS, SEVEN_DAYS } from "../constants";
import { InviteMemberModal } from "@/features/shared/components/InviteMemberModal";
import { SearchMember } from "@/features/shared/api/api";
import { MemberRoleId } from "@/features/studio/api/member";
import {
  useApproveMemberRequest,
  useCancelRequest,
  useRemoveMember,
} from "@/features/studio/hooks/use-member";
import { Tooltip } from "@/design-system/components/tooltip";
import { ConfirmationModal } from "@/features/shared/components/modal/ConfirmationModal";
import { useModal } from "@/hooks/use-modal";
import { useLeaveClub } from "@/features/membership/hooks/use-club";

const ROW_GRID_COLS =
  "md:grid-cols-[1fr_100px_120px_40px] lg:grid-cols-[1fr_260px_160px_88px]";

function getStatusLabel(member: ClubMember) {
  if (member.isInvited) return "Pending Invitation";
  if (member.isPending) return "Pending Acceptance";
  return null;
}

export function MembersTab({
  clubId,
  members,
  isOwner,
  currentUserId,
  onInvite,
  onMemberInvited,
  isPermit,
  isPublicClub,
  clubSlug,
}: {
  clubId: number | string;
  members: ClubMember[];
  isOwner: boolean;
  currentUserId: string;
  onInvite?: () => void;
  onMemberInvited?: (member: SearchMember, roleId: MemberRoleId) => void;
  isPermit?: boolean;
  isPublicClub?: boolean;
  clubSlug: string;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const leaveClub = useLeaveClub();
  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  const closeMenu = () => setOpenMenuId(null);

  const isPending = (m: ClubMember) => m.isPending || m.isInvited;
  const isJoinRequest = (m: ClubMember) => m.isPending && !m.isInvited;
  const cancelRequest = useCancelRequest();
  const approveRequest = useApproveMemberRequest();
  const removeMember = useRemoveMember();

  const pendingRequestsCount = members.filter(
    (m) => m.isPending && !m.isInvited,
  ).length;
  const invitedCount = members.filter((m) => m.isInvited).length;

  const handleInviteClick = () => {
    onInvite?.();
    setIsInviteOpen(true);
  };

  const { show, visible, close } = useModal();

  const handleLeaveClub = () => {
    leaveClub.mutate(
      { clubId: clubId as number, clubName: clubSlug },
      {
        onSuccess: () => {
          toast.success("Left club successfully. 😢");
          close();
        },
        onError: () => {
          toast.danger("Failed to leave club.");
          close();
        },
      },
    );
  };

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        {isPermit || isOwner ? (
          <div className="flex flex-wrap items-center text-center justify-center gap-6 sm:gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Total
              </p>
              <p className="mt-0.5 text-white">{members.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Pending
              </p>
              <p className="mt-0.5 text-white">{pendingRequestsCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Invited
              </p>
              <p className="mt-0.5 font-semibold text-white">{invitedCount}</p>
            </div>
          </div>
        ) : null}

        {isOwner && (
          <Button
            onClick={handleInviteClick}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 w-full sm:w-auto justify-center"
          >
            <UserPlus className="h-4 w-4" />
            Invite member
          </Button>
        )}
      </div>

      <div
        className={`hidden md:grid ${ROW_GRID_COLS} items-center border-b border-white/10 pb-2 text-xs uppercase tracking-wider text-white/40`}
      >
        <span>Member</span>
        <span className="text-right">Type</span>
        <span className="text-right">Joined</span>
        <span />
      </div>

      <div className="md:hidden flex items-center justify-between border-b border-white/10 pb-2 text-xs uppercase tracking-wider text-white/40">
        <span>Members</span>
        <span>{members.length}</span>
      </div>

      <ul className="divide-y divide-white/5">
        {members.map((member) => {
          const pending = isPending(member);
          const joinRequest = isJoinRequest(member);
          const statusLabel = getStatusLabel(member);
          const menuOpen = openMenuId === member.id;
          const joined = member.joinedAt
            ? formatUnixDate(member.joinedAt)
            : "—";
          const isSelf = member.id === currentUserId;
          const canRemove = isOwner && !isSelf;

          return (
            <li key={member.id} className="relative">
              <div
                className={`flex flex-col gap-2 md:grid ${ROW_GRID_COLS} items-start md:items-center py-3`}
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <MemberAvatar
                    displayName={member.displayName || member?.username}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-medium text-white truncate">
                      {member.displayName}
                    </span>
                    <span className="text-xs font-medium text-white/40 truncate">
                      @{member.username}
                    </span>
                  </div>

                  {!pending &&
                    member.joinedAt &&
                    NOW_SECONDS - member.joinedAt < SEVEN_DAYS && (
                      <span className="shrink-0 rounded bg-[#2F8CFF]/12 border border-[#2F8CFF]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2F8CFF]/80">
                        New Member
                      </span>
                    )}

                  {(isOwner || isSelf) && (
                    <button
                      onClick={() => toggleMenu(member.id)}
                      className="cursor-pointer md:hidden ml-auto shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                  {statusLabel ? (
                    <>
                      <span
                        className={`text-xs ${member.isInvited ? "text-white/30 italic" : member.isPending ? "text-yellow-200/70 italic" : "text-white/60"}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-white/20">•</span>
                    </>
                  ) : null}

                  <span
                    className={`text-sm ${pending ? "text-white/30 italic" : "text-white/60"}`}
                  >
                    {member.role}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-sm text-white/40">{joined}</span>
                </div>

                <span
                  className={`hidden md:block  ${member.isInvited ? "text-white/30 italic" : member.isPending ? "text-yellow-200/70 italic" : "text-white/60"}`}
                >
                  <div className="flex items-center gap-1 text-sm justify-end text-center">
                    {member.isPending && !member.isInvited && (
                      <Tooltip content="Pending founder or co-founder action">
                        <InfoIcon size={12} />
                      </Tooltip>
                    )}
                    {statusLabel ? statusLabel : null}{" "}
                    {statusLabel ? (
                      <span className="px-2 text-white/20">•</span>
                    ) : null}
                    {member.role}
                  </div>
                </span>

                <span className="hidden md:block text-right text-sm text-white/40">
                  {statusLabel ? "-" : joined}
                </span>

                <div className="hidden md:flex justify-end">
                  {(isOwner || isSelf) && (
                    <button
                      onClick={() => toggleMenu(member.id)}
                      className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeMenu} />
                  <div className="absolute right-0 top-15 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                    {joinRequest && isOwner && (
                      <>
                        <button
                          onClick={() => {
                            approveRequest.mutate(
                              {
                                clubId,
                                memberId: member.id,
                              },
                              {
                                onSuccess: () => {
                                  toast.success(
                                    "Request has been approved. New member added!",
                                  );
                                },
                                onError: (error) => {
                                  toast.danger(
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to approve request.",
                                  );
                                },
                              },
                            );
                            closeMenu();
                          }}
                          disabled={approveRequest.isPending}
                          className="cursor-pointer flex w-full items-center gap-2 px-4 py-3 text-sm text-emerald-400 hover:bg-white/5 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Accept request
                        </button>
                        <button
                          onClick={() => {
                            cancelRequest.mutate(
                              {
                                clubId,
                                memberId: member.id,
                              },
                              {
                                onSuccess: () => {
                                  toast.success("Request has been cancelled.");
                                },
                                onError: (error) => {
                                  toast.danger(
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to cancel request.",
                                  );
                                },
                              },
                            );
                            closeMenu();
                          }}
                          disabled={cancelRequest.isPending}
                          className="cursor-pointer flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel request
                        </button>
                      </>
                    )}

                    {member.isInvited && isOwner && (
                      <button
                        onClick={() => {
                          cancelRequest.mutate(
                            {
                              clubId,
                              memberId: member.id,
                            },
                            {
                              onSuccess: () => {
                                toast.success("Invitation has been cancelled.");
                              },
                              onError: (error) => {
                                toast.danger(
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to cancel invitation.",
                                );
                              },
                            },
                          );
                          closeMenu();
                        }}
                        disabled={cancelRequest.isPending}
                        className="cursor-pointer flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel invite
                      </button>
                    )}

                    {!pending && isSelf && (
                      <button
                        onClick={show}
                        className="cursor-pointer flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Leave club
                      </button>
                    )}

                    {!pending && canRemove && (
                      <button
                        onClick={() => {
                          removeMember.mutate(
                            {
                              clubId,
                              memberId: member.id,
                            },
                            {
                              onSuccess: () => {
                                toast.success("Member has been removed.");
                              },
                              onError: (error) => {
                                toast.danger(
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to remove member.",
                                );
                              },
                            },
                          );
                          closeMenu();
                        }}
                        disabled={removeMember.isPending}
                        className="disabled:opacity-50 cursor-pointer flex w-full items-center gap-2 px-4 py-3 text-sm disabled:text-gray-600 text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <UserX className="h-4 w-4" />
                        Remove member
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {visible && (
        <ConfirmationModal
          title="Leave this club"
          description={
            isPublicClub
              ? "Are you sure you want to leave this club? Once you leave a club, you can join again later."
              : "Are you sure you want to leave this club? Once you leave a club, you have to be invited or can request to join again later."
          }
          isPending={leaveClub.isPending}
          onConfirm={handleLeaveClub}
          onClose={close}
          variant="danger"
        />
      )}

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        clubId={clubId}
        existingMembers={members}
        onInvited={onMemberInvited}
      />
    </div>
  );
}
