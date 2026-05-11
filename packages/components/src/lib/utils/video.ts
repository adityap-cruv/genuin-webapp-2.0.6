/**
 * Checks if a video (File or URL) matches a target aspect ratio (e.g., 9:16 or 16:9)
 *
 * @param videoSource - File object or video URL (string)
 * @param targetWidth - Target width part of the aspect ratio (e.g., 9 for 9:16)
 * @param targetHeight - Target height part of the aspect ratio (e.g., 16 for 9:16)
 * @param tolerance - Optional tolerance percentage (default: 2%) to handle minor differences
 * @returns Promise<boolean>
 */
export const validateVideoAspectRatio = (
  videoSource: File | string,
  aspectRatio: "9:16" | "1:1" = "9:16", // "9:16" (width : height)
  tolerance: number = 0.0005 // lowerbound = 0.5620, upperbound = 0.5630
): Promise<boolean> => {
  const targetWidth = Number(aspectRatio.split(":")[0]);
  const targetHeight = Number(aspectRatio.split(":")[1]);

  return new Promise((resolve, reject) => {
    const isFile = videoSource instanceof File;
    const isValidInput = isFile || (typeof videoSource === "string" && videoSource.length > 0);

    if (!isValidInput) {
      return reject("Invalid video source");
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const { videoWidth, videoHeight } = video;

      const actualRatio = videoWidth / videoHeight;
      const targetRatio = targetWidth / targetHeight;

      const lowerBound = targetRatio * (1 - tolerance);
      const upperBound = targetRatio * (1 + tolerance);

      resolve(actualRatio >= lowerBound && actualRatio <= upperBound);

      if (isFile) {
        URL.revokeObjectURL(video.src);
      }
    };

    video.onerror = () => {
      reject("Failed to load video metadata");
    };

    video.src = isFile ? URL.createObjectURL(videoSource) : videoSource;
  });
};
/**
 * Validates if a video (File or URL) meets min and max duration constraints.
 *
 * @param videoSource - File object or video URL (string)
 * @param minDuration - Optional minimum duration in seconds
 * @param maxDuration - Optional maximum duration in seconds
 * @returns Promise<boolean>
 */
export const validateVideoDuration = (
  videoSource: File | string,
  minDuration?: number,
  maxDuration?: number
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const isFile = videoSource instanceof File;
    const isValidInput = isFile || (typeof videoSource === "string" && videoSource.length > 0);

    if (!isValidInput) {
      return reject("Invalid video source");
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const { duration } = video;

      const isValid =
        (minDuration === undefined || duration >= minDuration) &&
        (maxDuration === undefined || duration <= maxDuration);

      resolve(isValid);

      // Clean up if File was used
      if (isFile) {
        URL.revokeObjectURL(video.src);
      }
    };

    video.onerror = () => {
      reject("Failed to load video metadata");
    };

    video.src = isFile ? URL.createObjectURL(videoSource) : videoSource;
  });
};
