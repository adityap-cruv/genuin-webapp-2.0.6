import axios from "axios";
import { headers } from "next/headers";

import { getConfig } from "@/middleware";

import { toHttpUrl } from "../utils/common/url";

/**
 * type:1 -> profile
 *
 * type:2 -> community
 *
 * type:3 -> loop
 *
 * type:4 -> video
 *
 * type:5 -> brand landing page (subdomain or white label)
 *
 * type:6 -> brand slug (subdomain or white label)
 */
type MetadataPayloadType = Partial<{
  brandId: number;
  username: string;
  slug: string;
  shareImageId: number;
}> & {
  type: number;
};

export async function fetchMetadata({ type, brandId, username, slug, shareImageId }: MetadataPayloadType) {
  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const config = getConfig(host);

    const params: Record<string, any> = {
      type,
      ...(brandId !== undefined && { brand_id: brandId }),
      ...(username !== undefined && { username }),
      ...(slug !== undefined && { slug }),
      ...(config?.domain !== undefined && { domain: config?.domain }),
      ...(config?.subdomain !== undefined && { subdomain: config?.subdomain }),
      ...(shareImageId !== undefined && { share_image_id: shareImageId }),
    };
    const response = await axios.get(toHttpUrl(process.env.NEXT_PUBLIC_API_URL) + "/api/v3/web/meta_data", { params });
    // Helper function to generate the URL with query parameters
    const generateUrlWithParams = (path: string, params?: Record<string, any>) => {
      let query = "";
      if (params && Object.keys(params)?.length > 0) {
        query = `?${new URLSearchParams(params).toString()}`;
      }
      return `${process.env.NEXT_PUBLIC_OG_CDN_URL}/api/og/${path}${query}`;
    };

    // Construct dynamic OG image URLs
    const platformBrandId = response?.data?.data?.platform_brand_id;
    const ogImageMap: Record<number, string> = {
      1: generateUrlWithParams(`${platformBrandId}/${type}/${username}`),
      2: generateUrlWithParams(`${platformBrandId}/${type}/${slug}`),
      3: generateUrlWithParams(`${platformBrandId}/${type}/${slug}`),
      4: generateUrlWithParams(`${platformBrandId}/${type}/${slug}`, {
        ...(shareImageId && { share_image_id: shareImageId }),
      }),
    };

    return {
      ...(response?.data?.data ?? {}),
      preview_image: ogImageMap[type] || response?.data?.data?.preview_image || "",
      ...config,
    };
  } catch (error: any) {
    console.log("error in metadeta api::", error);
    // throw new Error('Something went wrong with meta_data api.')
    if (error?.response?.status === 404) {
      return {};
    }
    return null;
  }
}
