import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { GroupUserStatusType } from "@genuin/components/types/roles";

/**
 * Function to join a group.
 */
async function joinGroup({ groupId }: { groupId: string }, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .post(API_PATHS.GROUP_JOIN, {
      chat_id: groupId,
    })
    .then((res) => {
      return res.data.data.status === "requested" ? "REQUESTED" : ("JOINED" as GroupUserStatusType);
    })
    .catch((e) => {
      // return { code: Number(e.response.data.code), data: null };
      throw new Error(e.response?.data?.message || "Failed to join group");
    });
}

/**
 * Custom hook to use the join group mutation.
 */
export function useJoinGroupMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: (props: Awaited<ReturnType<typeof joinGroup>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (params: { groupId: string }) => joinGroup(params, axiosInstance),
    onError,
    onSuccess,
  });
}

/**
 * A function to leave a group.
 * @param uuid - The UUID of the group to leave.
 * @returns
 */
async function leaveGroup({ groupId }: { groupId: string }, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .delete(API_PATHS.GROUP_LEAVE, {
      params: {
        chat_id: groupId,
      },
    })
    .then(() => {
      return "UNJOINED" as GroupUserStatusType;
    })
    .catch((e: any) => {
      // return { code: Number(e.response.data.code), data: null };
      throw new Error(e.response?.data?.message || "Failed to leave group");
    });
}

/**
 * Custom hook to use the leave group mutation.
 */
export function useLeaveGroupMutation({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (params: { groupId: string }) => leaveGroup(params, axiosInstance),
    onError,
    onSuccess,
  });
}
