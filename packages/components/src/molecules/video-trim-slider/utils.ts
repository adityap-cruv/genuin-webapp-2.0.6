// Helper function to format seconds into HH:MM:SS.M format
export function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const msecs = Math.floor((seconds % 1) * 10);

  let result = "";
  if (hrs > 0) result += `${hrs}:`;
  result += `${hrs > 0 && mins < 10 ? "0" : ""}${mins}:`;
  result += `${secs < 10 ? "0" : ""}${secs}`;
  // if (seconds < 60 && msecs > 0) result += `.${msecs}`;

  return result;
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(file);
  });
}

export async function getVideoMetadata(videoFileOrUrl: File | string): Promise<{
  aspect_ratio: string;
  duration: number;
  resolution: { width: number; height: number };
  size: number;
}> {
  let objectUrl: string | null = null;
  let fileSize = 0;

  if (videoFileOrUrl instanceof File) {
    objectUrl = URL.createObjectURL(videoFileOrUrl);
    fileSize = videoFileOrUrl.size;
  } else {
    // Try to fetch file size (if CORS allows)
    try {
      const headRes = await fetch(videoFileOrUrl, { method: "HEAD" });
      const sizeHeader = headRes.headers.get("Content-Length");
      if (sizeHeader) fileSize = parseInt(sizeHeader, 10);
    } catch {
      // Ignore size if fetch fails
    }
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.crossOrigin = "anonymous"; // Important for CORS-safe URLs
    video.src = objectUrl ?? (videoFileOrUrl as string);

    // Fix: Wait for 'loadedmetadata' **and** check duration !== Infinity
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;

      const gcdFn = (a: number, b: number): number => (b === 0 ? a : gcdFn(b, a % b));
      const divisor = gcdFn(width, height);
      const aspect_ratio = `${width / divisor}:${height / divisor}`;

      if (objectUrl) URL.revokeObjectURL(objectUrl);

      resolve({
        aspect_ratio,
        duration,
        resolution: { width, height },
        size: fileSize,
      });
    };

    video.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video metadata — invalid file or CORS issue."));
    };
  });
}

export async function urlToFile(url: string, mimeType = "video/mp4"): Promise<File> {
  if (!url) throw new Error("Invalid URL");
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url?.split("/").pop() || "video.mp4";
  return new File([blob], fileName, { type: mimeType });
}

type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
  aspectRatio: string | null; // Now a string like "16:9"
  resolution: string;
  size: number | null; // Only available for Blob/File
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatAspectRatio(width: number, height: number): string | null {
  if (width === 0 || height === 0) return null;
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;
  return `${w}:${h}`;
}

export async function loadVideoMetadata(source: Blob | File | string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let url: string | null = null;
    let size: number | null = null;

    if (typeof source === "string") {
      url = source;
      size = null;
    } else {
      url = URL.createObjectURL(source);
      size = source.size;
    }

    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      if (typeof source !== "string" && url) {
        URL.revokeObjectURL(url);
      }
      video.remove();
    };

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const aspectRatio = formatAspectRatio(width, height);
      const resolution = `${width}x${height}`;

      const resolveMetadata = () => {
        resolve({
          duration: video.duration,
          width,
          height,
          aspectRatio,
          resolution,
          size,
        });
        cleanup();
      };

      if (video.duration === Infinity) {
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          resolveMetadata();
        };
      } else {
        resolveMetadata();
      }
    };

    video.onerror = (error) => {
      console.error("Error loading video metadata:", error);
      cleanup();
      reject(new Error("Failed to load video metadata."));
    };

    video.style.display = "none";
    document.body.appendChild(video);
  });
}
