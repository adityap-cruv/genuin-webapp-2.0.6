import type { NextRequest } from "next/server";

import { handleOGImageRequest } from "../../../handlers/shared-og-handler";

/**
 * Route handler for generating OG images.
 *
 * Expected request URL shape:
 *   /api/og/:brandId/:type/:slug?share_image_id=...
 *
 * - brandId: optional numeric brand identifier (path segment)
 * - type: numeric type identifier (path segment)
 * - slug: resource slug (path segment)
 * - share_image_id: optional query param to select a specific share image
 */
export async function GET(request: NextRequest) {
  return handleOGImageRequest(request);
}
