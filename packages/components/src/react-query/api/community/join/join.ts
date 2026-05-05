import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { CommunityUserRole } from "@genuin/components/types/post";

/**
 * This api call is used to request to join a community.
 * It will return a code 200 if the request is successful.
 * @param communityId
 * @returns
 */
async function requestCommunity(communityId: string | undefined, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .post(API_PATHS.COMMUNITY_JOIN_REQUEST, {
      community_id: communityId,
    })
    .then((res) => {
      const status = res.data?.data?.status;
      if (status === "joined") {
        return "MEMBER" as CommunityUserRole;
      }
      return "REQUESTED" as CommunityUserRole;
    })
    .catch(() => {
      // return { code: Number(e.response.data.code) };
      throw new Error("Failed to request community");
    });
}

/**
 * Api call to join a community.
 * @param onboardingCommunities
 * @param communities - Array of community IDs to join
 * @param users - Array of user IDs to add to the communities
 * @returns
 */
async function joinCommunity(
  communities: string[],
  users: Array<{ user_id?: string }>,
  axiosInstance: AxiosInstance,
  onboardingCommunities?: boolean
) {
  return await axiosInstance
    .post(API_PATHS.COMMUNITY_ADD_USERS, {
      onboarding_communities: onboardingCommunities,
      communities,
      users,
    })
    .then(() => {
      // return { code: res.status, data: res.data.data };
      return "MEMBER" as CommunityUserRole;
    })
    .catch((_e) => {
      // return { code: Number(e.response.data.code) };
      throw new Error("Failed to join community");
    });
}

export function useJoinCommunityMutation({
  onSuccess,
  onError,
}: {
  onSuccess: (data: Awaited<ReturnType<typeof joinCommunity>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: async ({
      isPrivate,
      communities,
      users,
    }: {
      isPrivate: boolean;
      communities: string[];
      users: Array<{ user_id: string }>;
    }) => {
      if (isPrivate) {
        return await requestCommunity(communities[0], axiosInstance);
      }
      return await joinCommunity(communities, users, axiosInstance, undefined);
    },
    onSuccess,
    onError,
    // onSuccess: (response) => {
    //   if (response.code === 200) {
    //     if (variant === "pill") {
    //       toast({
    //         title:
    //           type === "private"
    //             ? "This community changed to private, please request to join the community"
    //             : "You've joined this community",
    //         duration: 3000,
    //       });
    //     }
    //     onStatusChange?.(type === "private" ? "REQUESTED" : "MEMBER");
    //   }
    // },
    // onError: () => {
    //   toast({
    //     title: `Failed to ${type === "private" ? "request to join" : "join"} the community`,
    //     variant: "destructive",
    //     duration: 3000,
    //   });
    // },
    // onSettled: async () => {
    //   await queryClient.invalidateQueries({
    //     queryKey: getQueryKeyForCommunityDetails(slug),
    //     type: "all",
    //   });
    // },
  });
}

export async function leaveCommunity(communityId: string | undefined, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .delete(API_PATHS.COMMUNITY_LEAVE, {
      params: {
        community_id: communityId,
      },
    })
    .then(() => {
      return "UNJOINED" as CommunityUserRole; // Returning empty string to indicate no role
    })
    .catch((_e) => {
      throw new Error("Failed to leave community");
    });
}

export function useLeaveCommunityMutation({
  onSuccess,
  onError,
}: {
  onSuccess: (data: Awaited<ReturnType<typeof leaveCommunity>>) => void;
  onError?: (error: Error) => void;
}) {
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (communityId: string | undefined) => leaveCommunity(communityId, axiosInstance),
    onSuccess,
    onError,
  });
}
