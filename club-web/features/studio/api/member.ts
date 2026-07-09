import { apiFetch } from "@/lib/api-types";

const clubMemberApi = (clubId: number | string): string =>
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/club/${clubId}/member`;

export const MEMBER_ROLE = {
  COFOUNDER: 2,
  MEMBER: 3,
} as const;

export type MemberRoleId = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];

export interface InviteClubMemberRequest {
  recipientId: string;
  roleId: MemberRoleId;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export class InviteMemberError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "InviteMemberError";
    this.status = status;
  }
}

export async function inviteClubMember(
  clubId: number | string,
  req: InviteClubMemberRequest,
  token: string,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${clubMemberApi(clubId)}/invite`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
    signal,
  });

  if (!res.ok) {
    let message = "Failed to send invitation";
    try {
      const json = (await res.json()) as ErrorResponse;
      if (json?.error) message = json.error;
    } catch {}
    throw new InviteMemberError(message, res.status);
  }
}

export const cancelRequest = (
  token: string,
  clubId: number | string,
  memberId: string,
) =>
  apiFetch<null>(`${clubMemberApi(clubId)}/${memberId}/cancel-request`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const removeClubMember = (
  token: string,
  clubId: number | string,
  memberId: string,
) =>
  apiFetch<null>(`${clubMemberApi(clubId)}/${memberId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const approveMemberRequest = (
  token: string,
  clubId: number | string,
  memberId: string,
) =>
  apiFetch<null>(`${clubMemberApi(clubId)}/${memberId}/approve-request`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
