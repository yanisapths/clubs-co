import { formatUnixDate } from "@/lib/utils";
import { Button } from "@heroui/react";
import {
  UserPlus,
  MoreHorizontal,
  LogOut,
  Check,
  X,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { ClubMember, MemberAvatar } from "./MemberAvatar";
import { NOW_SECONDS, SEVEN_DAYS } from "../constants";

const ROW_GRID_COLS =
  "md:grid-cols-[1fr_100px_120px_40px] lg:grid-cols-[1fr_220px_160px_88px]";

function getStatusLabel(member: ClubMember) {
  if (member.isInvited) return "Pending Invitation Response";
  if (member.isPending) return "Pending Acceptance Response";
  return null;
}

export function MembersTab({
  members,
  isOwner,
  onInvite,
  onAcceptRequest,
  onCancelRequest,
  onRemoveMember,
}: {
  members: ClubMember[];
  isOwner: boolean;
  onInvite?: () => void;
  onAcceptRequest?: (member: ClubMember) => void;
  onCancelRequest?: (member: ClubMember) => void;
  onRemoveMember?: (member: ClubMember) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  const closeMenu = () => setOpenMenuId(null);

  const isPending = (m: ClubMember) => m.isPending || m.isInvited;
  const isJoinRequest = (m: ClubMember) => m.isPending && !m.isInvited;

  const pendingRequestsCount = members.filter(
    (m) => m.isPending && !m.isInvited,
  ).length;
  const invitedCount = members.filter((m) => m.isInvited).length;

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
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

        {isOwner && (
          <Button
            onClick={onInvite}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 w-full sm:w-auto justify-center"
          >
            <UserPlus className="h-4 w-4" />+ Invite member
          </Button>
        )}
      </div>

      {/* Desktop/tablet header row */}
      <div
        className={`hidden md:grid ${ROW_GRID_COLS} items-center border-b border-white/10 pb-2 text-xs uppercase tracking-wider text-white/40`}
      >
        <span>Member</span>
        <span className="text-right">Type</span>
        <span className="text-right">Joined</span>
        <span />
      </div>

      {/* Mobile-only lightweight header */}
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

                  {isOwner && (
                    <button
                      onClick={() => toggleMenu(member.id)}
                      className="md:hidden ml-auto shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 md:hidden">
                  <span
                    className={`text-sm ${pending ? "text-white/30 italic" : "text-white/60"}`}
                  >
                    {statusLabel ?? member.role}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-sm text-white/40">{joined}</span>
                </div>

                <span
                  className={`hidden md:block text-right text-sm ${pending ? "text-white/30 italic" : "text-white/60"}`}
                >
                  {statusLabel ?? member.role}
                </span>

                <span className="hidden md:block text-right text-sm text-white/40">
                  {statusLabel ? "-" : joined}
                </span>

                <div className="hidden md:flex justify-end">
                  {isOwner && (
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
                    {joinRequest && (
                      <>
                        <button
                          onClick={() => {
                            onAcceptRequest?.(member);
                            closeMenu();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-emerald-400 hover:bg-white/5 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Accept request
                        </button>
                        <button
                          onClick={() => {
                            onCancelRequest?.(member);
                            closeMenu();
                          }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel request
                        </button>
                      </>
                    )}

                    {member.isInvited && (
                      <button
                        onClick={() => {
                          onCancelRequest?.(member);
                          closeMenu();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel invite
                      </button>
                    )}

                    {!pending && (
                      <>
                        <button
                          onClick={closeMenu}
                          disabled={isOwner}
                          className="disabled:opacity-50 flex w-full items-center gap-2 px-4 py-3 text-sm disabled:text-gray-600 text-red-400 !disabled:hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Leave club
                        </button>
                        <button
                          onClick={() => {
                            onRemoveMember?.(member);
                            closeMenu();
                          }}
                          disabled={isOwner}
                          className="disabled:opacity-50 flex w-full items-center gap-2 px-4 py-3 text-sm disabled:text-gray-600 text-white/70 !disabled:hover:bg-white/5 transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                          Remove member
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
