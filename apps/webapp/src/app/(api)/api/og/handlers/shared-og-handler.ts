import axios from "axios";
import type { NextRequest } from "next/server";

import { toHttpUrl } from "@/lib/utils/common/url";

import { getDefaultImageReponse } from "../get-image-reponse";
import { imageOptions, loadFonts } from "../image-options";
import type { Params } from "../types";
import { parseUrlSegments } from "../utils";
import { validateRequestUrl } from "../validation";

interface CustomImageResponse {
  /** Whether this response should be used */
  shouldHandle: boolean;
  /** The custom image response */
  response: Response;
}

interface OGHandlerOptions {
  /** Additional params transformer for specific routes */
  transformParams?: (params: Params) => Params;
  /**
   * Custom image response generator for route-specific cases.
   * Return { shouldHandle: true } to use the custom response, or { shouldHandle: false } to fall back to default.
   */
  getCustomResponse?: (params: Params, data: any) => Promise<CustomImageResponse>;
}

/**
 * Shared handler for generating OG images across different routes.
 *
 * @param request The incoming Next.js request
 * @param options Configuration options for the handler
 * @returns Response with either an image or error status
 */
export async function handleOGImageRequest(request: NextRequest, options: OGHandlerOptions = {}) {
  // Parse and validate URL segments
  const { pathname, searchParams } = new URL(request.url);
  const { brandId, type, slug, shareImageId } = parseUrlSegments(pathname, searchParams);

  // Validate path segments early and return the validation error response
  const validationError = validateRequestUrl({ type, slug, brandId });
  if (validationError) return validationError;

  try {
    // Build base parameters
    let params = {
      slug,
      type: Number(type),
      ...(brandId && { brand_id: Number(brandId) }),
      ...(shareImageId && { share_image_id: shareImageId }),
    } as Params;

    // Allow route-specific parameter transformations
    if (options.transformParams) {
      params = options.transformParams(params);
    }

    // Load fonts and fetch metadata
    const fonts: any[] = await loadFonts();
    const { data } = await axios.get(`${toHttpUrl(process.env.NEXT_PUBLIC_API_URL)}/api/v3/og_meta_data`, { params });

    // Check if the response is valid
    if (data?.code !== 200 || !data?.data) {
      console.log("Failed to fetch OG Metadata:");
      return Response.json("404 - Not Found", { status: 404 });
    }

    // Try to get a custom response if handler is provided
    if (options.getCustomResponse) {
      const { shouldHandle, response } = await options.getCustomResponse(params, data.data);
      if (shouldHandle && response) {
        return response;
      }
    }

    // Generate default image response if no custom handler or it declined to handle
    const imageResponse = await getDefaultImageReponse({
      type: params.type,
      data: data?.data,
      imageOptions: { ...imageOptions, fonts },
    });

    return imageResponse;
  } catch (error: any) {
    console.log("Failed to generate OG Image:", error);
    return Response.json("404 - Not Found", { status: 404 });
  }
}
