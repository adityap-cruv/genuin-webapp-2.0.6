import { useInfiniteQuery } from "@tanstack/react-query";

import { axiosInstance } from "@genuin/components/context/axios/context";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { getQueryKeyForPaginatedPosts } from "../../keys/video";

import type { Brand, PaginatedAllowedBrandsParams, PaginatedAllowedBrandsResponse } from "./types";

function validateResponse(
  apiResponse: any,
  requestParams: Partial<PaginatedAllowedBrandsParams>
): PaginatedAllowedBrandsResponse {
  if (!apiResponse || typeof apiResponse !== "object") {
    throw new Error("Invalid response data");
  }

  if (apiResponse.code !== 200) {
    throw new Error(`API error: ${apiResponse.message || "Unknown error"}`);
  }

  if (!apiResponse.data || typeof apiResponse.data !== "object") {
    throw new Error("Invalid response data structure");
  }

  if (!Array.isArray(apiResponse.data.brands)) {
    throw new Error("Brands data must be an array");
  }

  const brands: Brand[] = apiResponse.data.brands;
  const total = apiResponse.data.pagination.total || brands.length;
  const page = requestParams.page || 1;
  const limit = requestParams.limit || 10;
  const totalPages = Math.ceil(total / limit);
  return {
    data: brands,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function fetchPaginatedAllowedBrands(
  params: Partial<PaginatedAllowedBrandsParams> = {}
): Promise<PaginatedAllowedBrandsResponse> {
  try {
    const response = await axiosInstance.get(API_PATHS.BRAND_WEBSITES, {
      params: {
        limit: params.limit || 10,
        page: params.page || 1,
        platform: "web",
        brand_id: params.brand_id,
        ...(params.query_string && { query_string: params.query_string }),
      },
    });

    return validateResponse(response?.data, params);
  } catch (error: any) {
    throw new Error("Something went wrong while fetching posts!");
  }
}

export function usePaginatedAllowedBrands(params: Partial<PaginatedAllowedBrandsParams> = {}) {
  const query = useInfiniteQuery({
    queryKey: getQueryKeyForPaginatedPosts(params),
    queryFn: ({ pageParam }) => fetchPaginatedAllowedBrands({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;

      if (typeof lastPage?.meta?.page !== "number") return undefined;

      const isLastPage = lastPage?.meta?.page === lastPage?.meta?.totalPages;

      return isLastPage ? undefined : lastPage.meta.page + 1;
    },
    initialPageParam: 1,
    // Reset pagination when search params change
    refetchOnWindowFocus: false,
  });

  // Flatten pages into a single data array
  const flattenedData = query.data?.pages.flatMap((page) => page.data) ?? [];
  const lastPageMeta = query.data?.pages[query.data.pages.length - 1]?.meta;

  return {
    ...query,
    data: flattenedData,
    meta: lastPageMeta,
  };
}
