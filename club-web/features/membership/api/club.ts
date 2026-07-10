//club-web/features/membership/api/club.ts
import {
  ClubCategory,
  ClubMember,
  Space,
  Tag,
} from "@/features/studio/api/club";
import { SocialLink } from "@/features/studio/api/common";
import { apiFetch } from "@/lib/api-types";
import { getStoredToken } from "@/lib/storage";

const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership/club`;

export interface MembershipMessage {
  message: string;
}

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

export const getMembershipClubs = () =>
  apiFetch<MembershipClub[]>(baseApi, {
    method: "GET",
    headers: getStoredToken()
      ? {
          Authorization: `Bearer ${getStoredToken()}`,
        }
      : undefined,
  });

type MemberRole = "Founder" | "CoFounder" | "Member";
export interface Club {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  memberCount: number;
  allowFollowers: boolean;
  category: ClubCategory;
  createdAt: number;
  isMember?: boolean;
  socialLinks?: SocialLink[];
  spaces: Space[];
  tags: Tag[];
  owner: string;
  ownerDisplayName: string;
  galleryUrls?: string[];
  isOwner: boolean;
  activate: boolean;
  joinedAt: number | null;
  memberRole?: MemberRole;
  isPending?: boolean;
  invite?: InviteInfo;
}

export interface InviteInfo {
  inviterUsername: string;
  inviterDisplayName: string;
  inviterImageUrl: string;
  invitedAt: number;
  invitedAs: string;
  isInvited: boolean;
}
export interface MembershipClubDetailResponse {
  clubInfo: Club;
}

export const getMembershipClubById = (id: number) =>
  apiFetch<MembershipClubDetailResponse>(`${baseApi}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });

export const getMembershipClubByName = (encodedName: string) =>
  apiFetch<MembershipClubDetailResponse>(`${baseApi}/${encodedName}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });

export const joinClub = (id: number, token: string) =>
  apiFetch<MembershipMessage>(`${baseApi}/${id}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const leaveClub = (id: number, token: string) =>
  apiFetch<MembershipMessage>(`${baseApi}/${id}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export interface ClubMemberListResponse {
  members: ClubMember[];
}

export const getClubMemberListByName = (encodedName: string) =>
  apiFetch<ClubMemberListResponse>(`${baseApi}/${encodedName}/member`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getStoredToken()}`,
    },
  });

export interface Pagination {
  prev: number | null;
  next: number | null;
  current: number;
  hasMore: boolean;
  totalPages: number;
  totalRecords: number;
}

export interface ClubListByCategorySlugResponse {
  clubs: MembershipClub[];
  pagination: Pagination;
}

export interface GetClubByCategorySlugParams {
  categorySlug: string;
  limit?: number;
  offset?: number;
}
export const getClubListByCategorySlug = ({
  categorySlug,
  limit = 12,
  offset = 0,
}: GetClubByCategorySlugParams) =>
  apiFetch<ClubListByCategorySlugResponse>(
    `${baseApi}/category/${categorySlug}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getStoredToken()
        ? {
            Authorization: `Bearer ${getStoredToken()}`,
          }
        : undefined,
    },
  );

export interface GetClubListPaginatedParams {
  limit?: number;
  offset?: number;
}

export const getClubListPaginated = ({
  limit = 12,
  offset = 0,
}: GetClubListPaginatedParams = {}) =>
  apiFetch<ClubListByCategorySlugResponse>(
    `${baseApi}/list?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: getStoredToken()
        ? {
            Authorization: `Bearer ${getStoredToken()}`,
          }
        : undefined,
    },
  );
