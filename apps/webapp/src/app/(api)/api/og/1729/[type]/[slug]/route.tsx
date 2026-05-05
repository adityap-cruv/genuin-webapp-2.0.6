import type { NextRequest } from "next/server";

import { handleOGImageRequest } from "../../../handlers/shared-og-handler";
import { get1729CustomResponse } from "../../handlers";

export async function GET(request: NextRequest) {
  return handleOGImageRequest(request, {
    transformParams: (params) => ({
      ...params,
      // Apply 1729-specific parameter transformations
      ...(params.brandId && params.type === 1 && { brand_id: params.brandId }),
      ...(params.shareImageId && params.type === 4 && { share_image_id: params.shareImageId }),
    }),
    getCustomResponse: get1729CustomResponse,
  });
}
