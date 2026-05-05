import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { queryClient } from "@genuin/components/react-query/client";
import { getQueryKeyForksCbStatus } from "@genuin/components/react-query/keys/become-creator";
import type { ksCbRequestStatusType } from "@genuin/components/types/roles";

import { API_PATHS } from "../../paths";

/**
 * Returns the KS CB request status. If there is an error, it will return status 4.
 * The status can be:
 * - 1: Pending to request.
 * - 2: Requested. -> If request is rejected or approved then the status will be updated to 3 (in case of appr.) or 1 (in case of rejected).
 * - 3: Accepted.
 * @returns { { status: number } } - The status of the request.
 */

export async function fetchKsCbRequestStatus(axiosInstance: AxiosInstance): Promise<{
  status: ksCbRequestStatusType;
}> {
  try {
    const res = await axiosInstance.get(API_PATHS.BECOME_CREATOR_REQUEST_STATUS);
    return {
      status: parseBecomeCreatorStatus(res.data.data.cb_request_status) ?? "Pending",
    };
  } catch (_e) {
    throw new Error("Something went wrong!");
  }
}

export function parseBecomeCreatorStatus(status: number | undefined): ksCbRequestStatusType | undefined {
  if (status === undefined || status === null) return undefined;
  return status === 1 ? "Pending" : status === 2 ? "Requested" : "Accepted";
}

export function useKsCbStatus({ id }: { id: string }) {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForksCbStatus(id),
    queryFn: (_context) => fetchKsCbRequestStatus(axiosInstance),
    // staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}

async function postCbRequest(axiosInstance: AxiosInstance): Promise<{ isRequestSent: boolean; data: any }> {
  try {
    const res = await axiosInstance.post(API_PATHS.BECOME_CREATOR_REQUEST, {
      source: "app_web",
    });
    return { isRequestSent: res.data.code === 200, data: res.data.data };
  } catch (_e) {
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
  const axiosInstance = useAxiosInstance();

  return useMutation({
    mutationFn: (_) => postCbRequest(axiosInstance),
    onSuccess,
    onError,
  });
}

export function setQueryDataBecomeCreator(id: string) {
  queryClient.setQueryData<{ status: ksCbRequestStatusType }>(getQueryKeyForksCbStatus(id), () => ({
    status: "Requested",
  }));
}
