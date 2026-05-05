import { ImageResponse } from "next/og";

import { profile, community, group, video } from "./template";
import { fetchImageResponse } from "./utils";

/**
 * Returns an ImageResponse based on the given type and data.
 * Used for generating profile, community, group, and video images.
 *
 * @param {number} type - The type of image to generate (1=profile, 2=community, 3=group, 4=video)
 * @param {object} data - The data object used to render the image
 * @param {object} imageOptions - Common image options (width, height, etc.)
 * @param {Array} fonts - Fonts to be passed to the ImageResponse
 * @returns {Promise<ImageResponse|undefined>} - The generated image response
 */

interface defaultImageResponseProps {
  data: any;
  type: number;
  imageOptions: { width: number; height: number; fonts: any[] };
}

export async function getDefaultImageReponse({ type, data, imageOptions }: defaultImageResponseProps) {
  try {
    let imageResponse;

    if (type === 1) {
      imageResponse = new ImageResponse(profile({ profileData: data }), imageOptions);
    }

    if (type === 2) {
      imageResponse = new ImageResponse(community({ communityData: data }), imageOptions);
    }

    if (type === 3) {
      imageResponse = new ImageResponse(group({ groupData: data }), imageOptions);
    }

    if (type === 4) {
      const previewImage = data?.preview_image;
      // If preview_image exists then use it
      if (previewImage) {
        const fetchImageRes = await fetchImageResponse(previewImage);
        if (fetchImageRes) return fetchImageRes;
      }

      imageResponse = new ImageResponse(video({ videoData: data }), imageOptions);
    }

    return imageResponse;
  } catch (error) {
    console.log("Failed to generate image response", error);
    throw error;
  }
}
