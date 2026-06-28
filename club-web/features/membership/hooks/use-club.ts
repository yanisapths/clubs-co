import {
  getMembershipClubById,
  getMembershipClubs,
  joinClub,
  leaveClub,
  MembershipClub,
} from "../api/club";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CLUB_KEYS = {
  all: ["membership-clubs"] as const,
  detail: (id: number) => ["membership-club", id] as const,
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
    club: query.data,
    isLoading: query.isLoading,
  };
};

export const useJoinClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => joinClub(clubId),
    onSuccess: (_, clubId) => {
      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.all,
      });

      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.detail(clubId),
      });
    },
  });
};

export const useLeaveClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: number) => leaveClub(clubId),
    onSuccess: (_, clubId) => {
      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.all,
      });

      queryClient.invalidateQueries({
        queryKey: CLUB_KEYS.detail(clubId),
      });
    },
  });
};
