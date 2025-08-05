import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { getQueryKeyForGroupMembers } from "@genuin/components/react-query/keys/group";
import { API_PATHS } from "@genuin/components/react-query/paths";

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
      if (!resData) {
        return {
          members: [],
          end: true,
        };
      }
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
      fetchGroupMembers(slug, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return undefined;
      const lastPageData = lastPage.members[lastPage.members.length - 1];
      if (!lastPageData) return undefined;
      return lastPageData?.member_id;
    },
    initialPageParam: undefined,
  });
}
