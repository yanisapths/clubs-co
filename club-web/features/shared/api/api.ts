// club-web/features/shared/api/api.ts

const membershipApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership`;

export async function checkUserExist(params: {
  email?: string;
  username?: string;
}): Promise<boolean> {
  const query = new URLSearchParams();

  if (params.email) query.set("email", params.email);
  if (params.username) query.set("username", params.username);

  const res = await fetch(`${membershipApi}/user/exist?${query.toString()}`);

  if (!res.ok) throw new Error("Failed to check");

  const json = await res.json();

  return json.data.exist;
}

// ── Global search ────────────────────────────────────────────────────────────
// Mirrors club-backend's SearchResponse (see SPECS.md → GET /membership/search).

export interface SearchClub {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  clubType: string;
  visibility: string;
  category: string;
  tags: { id: number; name: string }[];
  spaces: { id: number; name: string }[];
  createdAt: number;
  isMember: boolean;
  memberCount: number;
}

export interface SearchMember {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string;
  clubCount: number;
}

export interface SearchSpace {
  id: number;
  name: string;
  slug: string;
  city: string;
  country: string;
  clubCount: number;
}

export interface SearchCategory {
  id: number;
  name: string;
}

export interface SearchResponse {
  clubs: SearchClub[];
  members: SearchMember[];
  spaces: SearchSpace[];
  categories: SearchCategory[];
}

/**
 * Global search across clubs, members, spaces, and categories.
 * No auth required — pass an AbortSignal to cancel in-flight requests
 * (e.g. when the user keeps typing).
 */
export async function searchMembership(
  q: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const query = new URLSearchParams();
  if (q) query.set("q", q);

  const res = await fetch(`${membershipApi}/search?${query.toString()}`, {
    signal,
  });

  if (!res.ok) throw new Error("Failed to search");

  const json = await res.json();

  return json.data as SearchResponse;
}
