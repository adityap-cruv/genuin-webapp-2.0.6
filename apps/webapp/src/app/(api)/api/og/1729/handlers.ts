import { ImageResponse } from "next/og";

import { video } from "../template/1729";
import type { Params } from "../types";

/**
 * Custom response handlers for 1729 routes
 */
export async function get1729CustomResponse(params: Params, data: any) {
  // Handle video thumbnails for type 4
  if (params.type === 4 && data?.video_thumbnail) {
    return {
      shouldHandle: true,
      response: new ImageResponse(video({ videoData: data }), { width: 194, height: 344 }),
    };
  }

  // Add other custom response handlers for 1729 route here

  return {
    shouldHandle: false,
    response: null as any, // TypeScript requires this even though it won't be used when shouldHandle is false
  };
}
