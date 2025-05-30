import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForGroupMembers } from "src/react-query/keys/group";
import { API_PATHS } from "src/react-query/paths";

import { validateGroupMembers } from "./schema";

async function fetchGroupMembers(slug: string, pageParam?: string) {
  return await axiosInstance
    .get(API_PATHS.GROUP_MEMBERS, {
      params: {
        slug,
        last_member_id: pageParam,
      },
    })
    .then((res) => {
      const resData = res.data.data;
      return {
        members: validateGroupMembers(resData?.members),
        end: resData.end_of_result,
      };
    })
    .catch((e) => {
      throw new Error("Something went wrong in fetching loop cohosts.");
    });
}

export function useGetGroupMembers(slug: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForGroupMembers(slug),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchGroupMembers(slug, pageParam ?? ""),
    getNextPageParam: (lastPage) => {
      return lastPage.end ? undefined : lastPage.end;
    },
    initialPageParam: undefined,
  });
}
