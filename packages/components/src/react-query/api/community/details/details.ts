import { useQuery } from "@tanstack/react-query";

import { NOT_FOUND_ERROR_CODES } from "src/lib/constants/errors";
import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForCommunityDetails } from "src/react-query/keys/community";
import { API_PATHS } from "src/react-query/paths";

import { validateCommunityDetails } from "./schema";

async function fetchCommunityDetails(slug: string) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_DETAILS, {
      params: {
        slug,
      },
    })
    .then((res) => {
      return validateCommunityDetails(res.data.data);
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.community) {
        throw new Error(e.response.data.code);
      }
      throw new Error("Something went wrong with community detail!");
    });
}

export function useGetCommunityDetails(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForCommunityDetails(slug),
    queryFn: async () => await fetchCommunityDetails(slug),
  });
}
