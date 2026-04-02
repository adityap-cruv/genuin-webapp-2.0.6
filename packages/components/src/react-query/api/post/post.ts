import { useQuery } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "../../paths";
import type { AxiosInstance } from "axios";

/**
 * Fetch communities with groups list for a given brand ID.
 * This function retrieves a list of communities and groups where a video can be posted.
 * @returns
 */
async function fetchCommunityGroupList(axiosInstance: AxiosInstance) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_GROUP_FOR_POST, {})
    .then((res) => {
      return res.data.data;
    })
    .catch(() => {
      throw new Error("Something went wrong loops for post api.");
    });
}

/**
 * Custom hook to get communities and groups for a video.
 */
export function useGetCommunityGroupList() {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: ["brandId"],
    queryFn: (context) => fetchCommunityGroupList(axiosInstance),
  });
}
