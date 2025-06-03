import { useQuery } from "@tanstack/react-query";

import { NOT_FOUND_ERROR_CODES } from "src/lib/constants/errors";
import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForProfileDetails } from "src/react-query/keys/profile";
import { API_PATHS } from "src/react-query/paths";

import { validateProfileDetails } from "./schema";

/**
 * Fetch user data by nickname.
 * @param nickname - The nickname of the user.
 * @returns The user data.
 */
export async function fetchProfileDetails(
  nickname: string,
  forBrand: boolean = false
) {
  return await axiosInstance
    .post(API_PATHS.USER_DETAILS, {
      [forBrand ? "brand_slug" : "user_name"]: nickname,
    })
    .then((res) => {
      return validateProfileDetails(res.data.data);
    })
    .catch((e) => {
      if (
        e.response.data.code === NOT_FOUND_ERROR_CODES.user ||
        e.response.data.code === NOT_FOUND_ERROR_CODES.brand
      ) {
        throw new Error(e.response.data.code);
      }
      throw new Error("Something went wrong in profile details api.");
    });
}

export function useGetProfileDetails(userName: string, forBrand: boolean) {
  return useQuery({
    queryKey: getQueryKeyForProfileDetails(userName, forBrand),
    queryFn: () => fetchProfileDetails(userName, forBrand),
  });
}
