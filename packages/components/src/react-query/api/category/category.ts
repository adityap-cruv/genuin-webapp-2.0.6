import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForCategories } from "@genuin/components/react-query/keys/authentication";
import { useQuery } from "@tanstack/react-query";
import { parseCategory } from "./index";
import type { AxiosInstance } from "axios";

async function fetchCategories(axiosInstance: AxiosInstance) {
  try {
    const res = await axiosInstance.get(
      "/api/v3/trending/categories_communities"
    );
    const resData = res.data;
    return {
      categories: parseCategory(resData.data),
      end: resData.endOfResult,
    };
  } catch (e) {
    throw new Error("Something went wrong with category API!");
  }
}

export function useCategory() {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForCategories(),
    queryFn: () => fetchCategories(axiosInstance),
  });
}
