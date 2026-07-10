import { getStoredToken } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveMemberRequest,
  cancelRequest,
  removeClubMember,
} from "../api/member";

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
    }) => cancelRequest(getStoredToken()!, clubId, memberId),
    onSuccess: () => invalidateMembers(queryClient),
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
    }) => removeClubMember(getStoredToken()!, clubId, memberId),
    onSuccess: () => invalidateMembers(queryClient),
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
    }) => approveMemberRequest(getStoredToken()!, clubId, memberId),
    onSuccess: () => invalidateMembers(queryClient),
  });
};
