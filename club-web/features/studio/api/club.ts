import { apiFetch } from "@/lib/api-types";

const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/club`;

export interface Tag {
  id?: number;
  name?: string;
}

export interface ClubCategory {
  id?: number;
  name?: string;
}

export interface Space {
  id?: number;
  name?: string;
}

export interface Club {
  id: number;
  ownerId: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  allowFollowers: boolean;
  activate: boolean;
  socialLinks: Record<string, string>[];
  spaces: Space[];
  category: ClubCategory;
  tags: Tag[];
  createdAt: number;
  updatedAt: number;
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
}

export interface ClubDetail {
  clubInfo: Club;
  members: {
    username: string;
    id: string;
    role: string;
    joinedAt: number;
  }[];
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
