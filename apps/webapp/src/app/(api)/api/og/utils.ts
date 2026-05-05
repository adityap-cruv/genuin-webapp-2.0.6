export const BACKEND_ASSESTS_URL = `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/backend_assets`;

export const getProfileImageData = (props: { is_avatar: boolean; profile_image: string }) => {
  // Mapping of lottie placeholder names to background color codes.
  // These are used when we render avatar-style (lottie) placeholders so
  // the OG image has a consistent background color per placeholder.
  const lottie_color_code = {
    cow_face: "#CCCDCF",
    alien: "#A576A6",
    dog_face: "#EB6D4A",
    sloth: "#FEC62E",
    frog: "#54C8E8",
    hear_no_evil_monkey: "#9594D2",
    jack_o_lantern: "#54C8E8",
    owl: "#F0F5F8",
    penguin: "#6BCBB8",
    rabbit_face: "#835084",
    pile_of_poo: "#CFD2D3",
    pig_face: "#8DC6E8",
    robot: "#FEA328",
    ghost: "#1382CA",
    teddy_bear: "#C5D4E2",
    smiling_face_with_horns: "#A4E6DA",
    smiling_face_with_sunglasses: "#697B83",
    snowman: "#7D6991",
  };

  const DEFAULT_IMAGE = "smiling_face_with_sunglasses";
  // Default to a lottie placeholder image and its background color.
  // Note: we use a bracketed file name for the generic placeholder to match
  // existing backend asset naming convention.
  let url = `${BACKEND_ASSESTS_URL}/lottie/[${DEFAULT_IMAGE}].png`;
  let bgColour = lottie_color_code[DEFAULT_IMAGE];

  if (props.is_avatar === true) {
    // When the profile is an 'avatar' (i.e., a lottie-style identifier),
    // construct the backend assets URL for the specific lottie image and
    // pick the corresponding background color from the map above.
    url = `${BACKEND_ASSESTS_URL}/lottie/${props.profile_image}.png`;
    bgColour = lottie_color_code[props.profile_image as keyof typeof lottie_color_code];
  } else {
    // For standard uploaded profile images, point to the public media URL
    // and use a white background to make the image content stand out.
    url = `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/uploads/profile_images/${props.profile_image}`;
    bgColour = "#ffffff";
  }

  return { url, bgColour };
};

export function getAvatarFallback(name: string) {
  // Build a short fallback string (initials) for when an avatar image
  // is not available. Examples:
  //  - "John Doe" -> "JD"
  //  - "Alice" -> "A"
  if (!name) return "U";
  const strArray = name?.split(" ");
  let ans = "";
  // Take first character of the first name
  ans += strArray[0]?.charAt(0);
  // If a last name exists, append its first character
  if (strArray[1]) ans += strArray[1].charAt(0);
  return ans.toUpperCase();
}

// NOTE: BACKEND_ASSESTS_URL is derived from the public media base URL. It
// points to a special backend assets directory where placeholder (lottie)
// derived PNGs are stored. Keep this in sync with backend asset naming.

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fetch an image from a given URL and return it as a Response.
 * If the fetch fails, returns null so caller can handle fallback logic.
 *
 * @param {string} imageUrl - The URL of the image to fetch.
 * @returns {Promise<Response|null>} - The image Response, or null if fetching fails.
 */
export async function fetchImageResponse(imageUrl: string): Promise<Response | null> {
  if (!imageUrl || !isValidUrl(imageUrl)) {
    // Guard against empty or malformed URLs. We log to help diagnose
    // issues when OG image generation receives bad input.
    console.error("Invalid image url \n", imageUrl);
    return null;
  }

  try {
    const imageRes = await fetch(imageUrl);

    // Non-2xx responses are treated as failures so callers can fall back
    // to placeholder images or other strategies.
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch image`);
    }

    // Read the response as an ArrayBuffer and re-wrap into a Response
    // to decouple downstream code from the original fetch response object.
    const imageBuffer = await imageRes.arrayBuffer();

    return new Response(imageBuffer, {
      headers: { "Content-Type": imageRes.headers.get("content-type") || "image/png" },
    });
  } catch (err) {
    // Log and return null — consumers should handle null by using a
    // fallback image or rendering a placeholder.
    console.error("fetchImageResponse failed:", err);
    return null;
  }
}

// Parse URL segments and validate them
export function parseUrlSegments(pathname: string, searchParams: URLSearchParams) {
  const paths = pathname.split("/");
  return {
    brandId: paths[3],
    type: paths[4],
    slug: paths[5],
    shareImageId: searchParams.get("share_image_id"),
  };
}
