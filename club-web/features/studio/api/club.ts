import { apiFetch } from "@/lib/api-types";
import { SocialLink } from "./common";
import { MemberRole } from "@/features/membership/api/club";
const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/club`;

export interface Tag {
  id?: number;
  name?: string;
}

export interface ClubCategory {
  id: number;
  name: string;
  slug?: string;
  caption?: string;
}

export interface Space {
  id?: number;
  name?: string;
}

export interface Club {
  id: number;
  ownerId?: string;
  owner: string;
  ownerDisplayName: string;
  name: string;
  description: string;
  imageUrl: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  allowFollowers: boolean;
  activate: boolean;
  socialLinks?: SocialLink[];
  spaces: Space[];
  category: ClubCategory;
  tags: Tag[];
  createdAt: number;
  updatedAt?: number;
  galleryUrls?: string[];
  isOwner?: boolean;
  bannerUrl?: string;
  memberCount: number;
  pendingMemberCount?: number;
  pendingInviteCount?: number;
  memberRole?: MemberRole;
}

export interface CreateClubPayload {
  name: string;
  description: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  categoryId: number;
  tags?: Tag[];
  spaces?: Space[];
  activate: boolean;
  thumbnailImage?: string;
  socialLinks: SocialLink[];
}

export interface UpdateClubPayload {
  name?: string;
  description?: string;
  clubType?: "Public" | "Private" | "Exclusive";
  visibility?: "Anyone" | "MemberOnly";
  maxSeats?: number;
  categoryId?: number;
  displayStatus?: string;
  tags?: Tag[];
  spaces?: Space[];
  thumbnailImage?: string | null;
  socialLinks?: SocialLink[];
}

export interface ClubDetail {
  clubInfo: Club;
}

// --- API Functions ---

export const getClubList = (token: string) =>
  apiFetch<Club[]>(baseApi, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createClub = (token: string, payload: CreateClubPayload) =>
  apiFetch<Club>(baseApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const updateClubById = (
  token: string,
  id: number,
  payload: UpdateClubPayload,
) =>
  apiFetch<string>(`${baseApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const getClubById = (token: string, id: number) =>
  apiFetch<ClubDetail>(`${baseApi}/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteClubById = (token: string, id: number) =>
  apiFetch<null>(`${baseApi}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export interface PatchClubPayload {
  name?: string;
  description?: string;
  clubType?: "Public" | "Private" | "Exclusive";
  visibility?: "Anyone" | "MemberOnly";
  maxSeats?: number;
  categoryId?: number;
  displayStatus?: string;
  tags?: Tag[];
  spaces?: Space[];
  // `null` clears the thumbnail; `undefined`/omitted leaves it untouched —
  // mirrors the backend's NullableString "present vs absent" semantics.
  thumbnailImage?: string | null;
  // Temp-storage URLs (returned from uploading to club/temp) that should be
  // promoted to club/gallery and appended on save.
  galleriesToAdd?: string[];
  // Existing permanent club/gallery URLs to delete on save.
  galleriesToRemove?: string[];
  socialLinks?: SocialLink[];
  activate?: boolean;
  bannerUrl?: string | null;
}

export const patchClubById = (
  token: string,
  id: number,
  payload: PatchClubPayload,
) =>
  apiFetch<string>(`${baseApi}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export async function checkClubExist(params: {
  name?: string;
  token: string;
}): Promise<boolean> {
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);

  const res = await fetch(`${baseApi}/exist?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to check");

  const json = await res.json();
  return json.data.exist;
}

export interface ClubMemberResponse {
  members: ClubMember[];
}
export interface ClubMember {
  displayName: string;
  username: string;
  id: string;
  role: string;
  joinedAt: number;
  isPending?: boolean;
  isInvited?: boolean;
}

export const getClubMemberListById = (token: string, id: number) =>
  apiFetch<ClubMemberResponse>(`${baseApi}/${id}/member`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
