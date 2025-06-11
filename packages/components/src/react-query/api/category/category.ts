import { axiosInstance } from "@react-query/axios-instance";
import { useQuery } from "@tanstack/react-query";
import { getQueryKeyForCategories } from "@react-query/keys/authentication";
import { parseCategory } from "./index";

async function fetchCategories() {
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
  return useQuery({
    queryKey: getQueryKeyForCategories(),
    queryFn: fetchCategories,
  });
}
