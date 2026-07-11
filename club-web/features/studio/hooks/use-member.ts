import { getStoredToken } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveMemberRequest,
  cancelRequest,
  removeClubMember,
} from "../api/member";
import { MEMBERSHIP_CLUB_KEYS } from "@/features/membership/hooks/use-club";

const invalidateMembers = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === "members",
  });

export const useCancelRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
      clubName: string;
    }) => cancelRequest(getStoredToken()!, clubId, memberId),
    onSuccess: (_, { clubName }) => {
      invalidateMembers(queryClient);
      queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_CLUB_KEYS.detailByName(clubName),
      });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
      clubName: string;
    }) => removeClubMember(getStoredToken()!, clubId, memberId),
    onSuccess: (_, { clubName }) => {
      invalidateMembers(queryClient);
      queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_CLUB_KEYS.detailByName(clubName),
      });
    },
  });
};

export const useApproveMemberRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
      clubName: string;
    }) => approveMemberRequest(getStoredToken()!, clubId, memberId),
    onSuccess: (_, { clubName }) => {
      invalidateMembers(queryClient);
      queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_CLUB_KEYS.detailByName(clubName),
      });
    },
  });
};
