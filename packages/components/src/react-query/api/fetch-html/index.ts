import type { AxiosInstance } from "axios";

import { API_PATHS } from "@genuin/components/react-query/paths";

interface FetchCanonicalParams {
  url: string;
}

interface FetchCanonicalResponse {
  html: string;
}

export async function fetchHtml(
  params: FetchCanonicalParams,
  axiosInstance: AxiosInstance
): Promise<FetchCanonicalResponse> {
  try {
    const response = await axiosInstance.get(API_PATHS.FETCH_HTML, {
      params: { url: params.url },
    });

    return { html: response.data };
  } catch (_error) {
    throw new Error("Something went wrong while fetching HTML!");
  }
}
