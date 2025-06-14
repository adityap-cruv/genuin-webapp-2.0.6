import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";

/**
 * Generates a deep link URL with the provided parameters
 * @returns Shortened deep link URL or fallback to host URL
 */
interface DeepLinkPayload {
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  action?: string;
  contentType?: string;
  title?: string;
  description?: string;
  previewImage?: string | null;
  pathName?: string;
  fromUserName?: string | null;
  community?: string;
  loop?: string;
  searchParams?: Record<string, any>;
}

export const generateDeepLink = async (
  payload: DeepLinkPayload
): Promise<string> => {
  const queryParams: Record<string, any> = {};
  
  if (payload.utmCampaign) queryParams.utm_campaign = payload.utmCampaign;
  if (payload.utmSource) queryParams.utm_source = payload.utmSource;
  if (payload.utmMedium) queryParams.utm_medium = payload.utmMedium;
  if (payload.action) queryParams.action = payload.action;
  if (payload.contentType) queryParams.content_type = payload.contentType;
  if (payload.fromUserName) queryParams.from_username = payload.fromUserName;
  if (payload.community) queryParams.community = payload.community;
  if (payload.loop) queryParams.loop = payload.loop;

  const finalPayload = {
    query_params: { ...queryParams, ...payload.searchParams },
    title: payload.title,
    preview_url: payload.previewImage,
    path_params: payload.pathName,
    ...(payload.description && { description: payload.description }),
  };

  try {
    const res = await axiosInstance.post(
      API_PATHS.GENERATE_DYNAMIC_LINK,
      finalPayload
    );
    return res?.data?.data?.shortLink || process.env.NEXT_PUBLIC_HOST_URL || "";
  } catch (e) {
    return process.env.NEXT_PUBLIC_HOST_URL || "";
  }
};

/**
 * Resolves a deep link identifier to its full data
 * @returns Deep link data or null if resolution fails
 */
interface DeepLinkData {
  link: string;
  path: string;
  query_params: Record<string, string>;
}

export const resolveDeepLink = async (
  linkIdentifier: string
): Promise<DeepLinkData | null> => {
  try {
    const res = await axiosInstance.get(
      `/goservices/links/${linkIdentifier}`
    );
    return res?.data?.data || null;
  } catch (error) {
    console.error("Error resolving deep link:", error);
    return null;
  }
};
