import { apiFetch } from "@/lib/api-types";
import { getStoredToken } from "@/lib/storage";

const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership/club`;

export interface MembershipClub {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  memberCount: number;
  allowFollowers: boolean;
  category: string;
  createdAt: number | string;
  isMember?: boolean;
  tags?:
    | {
        id?: number;
        name?: string;
      }[]
    | null;
  spaces?:
    | {
        id?: number;
        name?: string;
      }[]
    | null;
}

export interface MembershipMessage {
  message: string;
}

export const getMembershipClubs = () =>
  apiFetch<MembershipClub[]>(baseApi, {
    method: "GET",
    headers: getStoredToken()
      ? {
          Authorization: `Bearer ${getStoredToken()}`,
        }
      : undefined,
  });

export const getMembershipClubById = (id: number) =>
  apiFetch<MembershipClub>(`${baseApi}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });

export const joinClub = (id: number) =>
  apiFetch<MembershipMessage>(`${baseApi}/${id}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });

export const leaveClub = (id: number) =>
  apiFetch<MembershipMessage>(`${baseApi}/${id}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });
