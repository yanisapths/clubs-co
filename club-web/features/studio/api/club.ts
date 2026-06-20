const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/club`;

export interface Tag {
  id?: number;
  name?: string;
}

export interface Space {
  id?: number;
  name?: string;
  country?: string;
  city?: string;
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
  spaceIds: number[];
  categoryName: string;
  tags: Tag[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateClubPayload {
  name: string;
  description?: string;
  clubType: "Public" | "Private" | "Exclusive";
  visibility: "Anyone" | "MemberOnly";
  maxSeats: number;
  categoryId: number;
  tags?: Tag[];
  spaces?: Space[];
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
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

export const getClubList = (token: string): Promise<ApiResponse<Club[]>> => {
  return fetch(baseApi, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

export const createClub = (
  token: string,
  payload: CreateClubPayload,
): Promise<ApiResponse<Club>> => {
  return fetch(baseApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
};

export const updateClubById = (
  token: string,
  id: number,
  payload: UpdateClubPayload,
): Promise<ApiResponse<string>> => {
  return fetch(`${baseApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
};

export const getClubById = (
  token: string,
  id: number,
): Promise<ApiResponse<ClubDetail>> => {
  return fetch(`${baseApi}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

export const deleteClubById = (
  token: string,
  id: number,
): Promise<ApiResponse<null>> => {
  return fetch(`${baseApi}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};
