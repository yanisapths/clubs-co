/* eslint-disable @typescript-eslint/no-explicit-any */
import { getStoredToken } from "@/lib/storage";
import {
  getClubListByCategorySlug,
  getClubListPaginated,
  getClubMemberListByName,
  getMembershipClubById,
  getMembershipClubByName,
  getMembershipClubs,
  joinClub,
  leaveClub,
  MembershipClub,
} from "../api/club";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClubCategory } from "@/features/studio/api/club";

export const CLUB_KEYS = {
  all: ["membership-clubs"] as const,
  detail: (id: number) => ["membership-club", id] as const,
  detailByName: (name: string) =>
    [...CLUB_KEYS.all, "detail", name.toLowerCase()] as const,
  members: (name: string) => ["members", name.toLowerCase()] as const,
};

export const useGetMembershipClubs = () => {
  const query = useQuery({
    queryKey: CLUB_KEYS.all,
    queryFn: getMembershipClubs,
    select: (res) => res.data,
  });

  return {
    query,
    clubs: (query.data ?? []) as MembershipClub[],
    isLoading: query.isLoading,
  };
};

export const useGetMembershipClubById = (id: number) => {
  const query = useQuery({
    queryKey: CLUB_KEYS.detail(id),
    queryFn: () => getMembershipClubById(id),
    enabled: !!id,
    select: (res) => res.data,
  });

  return {
    query,
    club: query.data?.clubInfo,
    isLoading: query.isLoading,
  };
};

export const useGetMembershipClubByName = (clubName: string) => {
  const query = useQuery({
    queryKey: CLUB_KEYS.detailByName(clubName),
    queryFn: () => getMembershipClubByName(encodeURIComponent(clubName)),
    enabled: !!clubName,
    select: (res) => res.data,
  });

  return {
    query,
    club: query.data?.clubInfo,
    isLoading: query.isLoading,
  };
};

export const useJoinClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId }: { clubId: number; clubName: string }) =>
      joinClub(clubId, getStoredToken()!),
    onSuccess: (_, { clubName }) => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.members(clubName) });
      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.detailByName(clubName),
      });
    },
  });
};

export const useLeaveClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clubId }: { clubId: number; clubName: string }) =>
      leaveClub(clubId, getStoredToken()!),
    onSuccess: (_, { clubName }) => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.members(clubName) });
      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.detailByName(clubName),
      });
    },
  });
};

export const useGetClubMemberListByName = (clubName: string) => {
  const query = useQuery({
    queryKey: CLUB_KEYS.members(clubName),
    queryFn: () => getClubMemberListByName(encodeURIComponent(clubName)),
    enabled: !!clubName,
    select: (res) => res.data,
  });

  return {
    query,
    members: query.data?.members,
    isLoading: query.isLoading,
  };
};

export interface PaginatedClubsResponse {
  clubs: MembershipClub[];
  category?: ClubCategory;
  nextCursor: number | null;
  hasMore: boolean;
  total: number;
}

export function mapPaginatedClubsResponse(data: any): PaginatedClubsResponse {
  return {
    clubs: data.clubs,
    category: data.category,
    nextCursor: data.pagination.next,
    hasMore: data.pagination.hasMore,
    total: data.pagination.totalRecords,
  };
}

export const useGetClubsByCategory = (categorySlug: string, limit = 12) => {
  const query = useQuery({
    queryKey: ["clubs-by-category", categorySlug, limit],
    queryFn: async () => {
      const response = await getClubListByCategorySlug({
        categorySlug,
        limit,
      });
      return response.data;
    },
    enabled: !!categorySlug,
  });

  return {
    query,
    clubs: query.data?.clubs ?? [],
    category: query.data?.category,
    isLoading: query.isLoading,
  };
};
