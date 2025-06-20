import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getQueryKeyForksCbStatus } from "@genuin/components/react-query/keys/become-creator";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "../../paths";
import { useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@genuin/components/react-query/client";
import { ksCbRequestStatusType } from "@genuin/components/types/roles";

/**
 * Returns the KS CB request status. If there is an error, it will return status 4.
 * The status can be:
 * - 1: Pending to request.
 * - 2: Requested. -> If request is rejected or approved then the status will be updated to 3 (in case of appr.) or 1 (in case of rejected).
 * - 3: Accepted.
 * @returns { { status: number } } - The status of the request.
 */

export async function fetchKsCbRequestStatus(): Promise<{
  status: ksCbRequestStatusType;
}> {
  try {
    const res = await axiosInstance.get(
      API_PATHS.BECOME_CREATOR_REQUEST_STATUS
    );
    return {
      status: parseBecomeCreatorStatus(res.data.data.cb_request_status),
    };
  } catch (e) {
    throw new Error("Something went wrong!");
  }
}

export function parseBecomeCreatorStatus(
  status: number
): ksCbRequestStatusType {
  return status === 1 ? "Pending" : status === 2 ? "Requested" : "Accepted";
}

export function useKsCbStatus({ id }: { id: string }) {
  return useQuery({
    queryKey: getQueryKeyForksCbStatus(id),
    queryFn: fetchKsCbRequestStatus,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}

async function postCbRequest(): Promise<{ isRequestSent: boolean; data: any }> {
  try {
    const res = await axiosInstance.post(API_PATHS.BECOME_CREATOR_REQUEST, {
      source: "app_web",
    });
    return { isRequestSent: res.data.code === 200, data: res.data.data };
  } catch (e: any) {
    throw new Error("Something went wrong");
  }
}

export function useCbRequestMutation({
  onSuccess,
  onError,
}: {
  onSuccess: (result: { isRequestSent: boolean; data: any }) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: postCbRequest,
    onSuccess,
    onError,
  });
}

export function setQueryDataBecomeCreator(id: string) {
  queryClient.setQueryData<{ status: ksCbRequestStatusType }>(
    getQueryKeyForksCbStatus(id),
    () => ({ status: "Requested" })
  );
}
