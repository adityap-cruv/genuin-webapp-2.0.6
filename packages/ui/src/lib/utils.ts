import { clsx, type ClassValue } from "clsx";
import DOMPurify from "dompurify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidHTTPS(link: string) {
  return link.startsWith("http") || link.startsWith("https") ? link : null;
}

export function tryJsonParse<T = unknown>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Returns the WebP URL for the given image URL, but only if it is an upload from the genuin-ecosystem.
 *
 * If the URL is null, undefined, or does not match the expected pattern, it returns an empty string.
 *
 * Example:
 * Input: "https://media.qa.begenuin.com/uploads/thumbnails/ee1edb6f-953f-4c9c-8907-0e3db0159872_1729682640952.png"
 * Output: "https://media.qa.begenuin.com/uploads/thumbnails/webp/ee1edb6f-953f-4c9c-8907-0e3db0159872_1729682640952.webp"
 *
 * @param {string | null | undefined} url - The image URL to be converted.
 * @returns {string} The corresponding WebP URL, or an empty string if the input URL is null or undefined or empty string.
 */
export function getWebpUrlForImage(url?: string | null): string {
  if (!url) return "";
  // return url;
  return url.includes("/uploads/")
    ? url.replace(/(\/)([^/]+)\.([^/.]+)$/, "$1webp/$2.webp")
    : url;
}

/**
 * Calculates the time difference between the current date and the provided timestamp,
 * and returns a human-readable string representing the time elapsed.
 *
 * @param {number} createdAt - The timestamp (in milliseconds) to calculate the time difference from.
 * @returns {string} A string representing the time elapsed, such as "5m" for 5 minutes,
 * "3h" for 3 hours, "2d" for 2 days, or "1w" for 1 week.
 */
export function getTimeAgo(createdAt: number): string {
  const currentDate = new Date();
  const createdAtDate = new Date(Number(createdAt));

  const timeDifference = currentDate.getTime() - createdAtDate.getTime();
  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) {
    return weeks + "w";
  } else if (days > 0) {
    return days + "d";
  } else if (hours > 0) {
    return hours + "h";
  } else {
    return minutes + "m";
  }
}

/**
 * This func returns the url for the reaction.
 * @param reaction type of reaction
 * @param isReacted if user have already reacted.
 * @returns
 */
export function getUrlForReaction(
  reaction: string,
  isReacted: boolean,
  forComment: boolean = false,
  theme: string = "light"
) {
  return `https://media.begenuin.com/webapp_assets/reactions/${reaction}/${theme === "dark" ? "dark/" : ""}${forComment ? "comment_" : "feed_"}${
    isReacted ? "selected" : "unselected"
  }.svg`;
}

/**
 * This function returns a random avatar name from the list of avatars.
 * @returns A random avatar name.
 */
export function getRandomAvatar() {
  const avatars = [
    "cow_face",
    "alien",
    "dog_face",
    "sloth",
    "frog",
    "hear_no_evil_monkey",
    "jack_o_lantern",
    "owl",
    "penguin",
    "rabbit_face",
    "pile_of_poo",
    "pig_face",
    "robot",
    "ghost",
    "teddy_bear",
    "smiling_face_with_horns",
    "smiling_face_with_sunglasses",
    "snowman",
  ];
  return avatars[Math.round(Math.random() * (avatars.length - 1))];
}

/**
 * Abbreviates a number using K (thousand) or M (million) suffixes.
 * Handles negative numbers, NaN, and ensures proper rounding.
 * For example, 1500 becomes "1.5K", 2000000 becomes "2M".
 *
 * @param value - The number to abbreviate.
 * @returns The abbreviated number as a string.
 */
export const abbreviateNumber = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0";
  if (value === 0) return "0";

  const absValue = Math.abs(value);
  const suffixes = ["", "K", "M"]; // Only up to million
  let suffixNum = 0;
  let shortValue = absValue;

  while (shortValue >= 1000 && suffixNum < suffixes.length - 1) {
    shortValue /= 1000;
    suffixNum++;
  }

  const rounded =
    shortValue % 1 !== 0 ? shortValue.toFixed(1) : shortValue.toString();
  const result = (value < 0 ? "-" : "") + rounded + suffixes[suffixNum];
  return result;
};

/**
 * Sanitizes user input to prevent XSS attacks
 * Only allows plain text by escaping dangerous HTML characters
 * @param input - The user input to sanitize
 * @returns Sanitized plain text string
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (typeof input !== "string" || input.trim() === "") return "";
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: false },
  });
}

/**
 * Converts an ISO 8601 date string to a local date format.
 *
 * @param isoString - The ISO 8601 date string to convert.
 * @returns The local date format as a string.
 * @example
 * // returns "October 23, 2024"
 * convertISOToLocalDateFormate("2024-10-23T10:00:00.000Z")
 */
export function convertISOToLocalDateFormate(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// /**
//  * Encrypts the given text using AES-256-CBC encryption.
//  * @param text - The text to encrypt.
//  * @param appendString - Whether to append a secret string to the text before encrypting.
//  * @returns The base64 encoded encrypted text.
//  */
// export function encryptText(text: string, appendString: boolean) {
//   // Extracting common variables
//   // TODO: Load these from env variables
//   // const iv = Buffer.from(process.env.NEXT_PUBLIC_AES_IV);
//   const iv = Buffer.from("load iv from env");
//   // const key = Buffer.from(process.env.NEXT_PUBLIC_AES_KEY);
//   const key = Buffer.from("load key from env");

//   // Appending secret string if needed
//   const textToEncrypt = appendString
//     ? text + process.env.NEXT_PUBLIC_SECRET_STRING
//     : text;

//   // Creating Cipher
//   const cipher = createCipheriv("aes-256-cbc", key, iv);

//   // Updating encrypted text
//   let encrypted = cipher.update(Buffer.from(textToEncrypt));
//   encrypted = Buffer.concat([encrypted, cipher.final()]);

//   // Returning base64 encoded encrypted text
//   return encrypted.toString("base64");
// }

export function checkAndAppendHttps(link: string): string {
  return link?.startsWith("http") || link?.startsWith("https")
    ? link
    : "https://" + link;
}

/**
 * Returns an object containing default sizes for icons in different sizes.
 */
export function defaultSizesForIcons() {
  return {
    xs: "gencl:size-3",
    sm: "gencl:size-4",
    md: "gencl:size-5",
    lg: "gencl:size-6",
    xl: "gencl:size-8",
  } as const;
}

export function encodeVideoSourceUrl(videoSource: string) {
  try {
    if (!videoSource || videoSource.trim() === "") {
      return videoSource; // Return if the source is empty or null
    }
    // Create a URL object to easily access query parameters
    const url = new URL(videoSource);
    // If there are no query parameters, return the original URL
    if (!url.search) {
      return videoSource;
    }
    // Get query parameters from the URL
    const params = new URLSearchParams(url.search);

    // Encode each parameter value
    for (const [key, value] of params.entries()) {
      params.set(key, encodeURIComponent(value));
    }

    // Return the complete encoded URL
    const paramString = params.toString();

    return `${url.origin}${url.pathname}${paramString ? "?" + paramString : ""}`;
  } catch (error) {
    console.error("Invalid URL:", error);
    return videoSource;
  }
}

/**
 * Formats a timestamp into a month-day or month-day-year string
 * If the year matches the current year, only month and day are shown
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function getMonthYear(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  // Format based on whether the year matches current year
  if (dateYear === currentYear) {
    // MMM dd format (e.g., "Aug 05")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {
    // MMM dd, yyyy format (e.g., "Aug 05, 2024")
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      // year: 'numeric'
    });
  }
}

/**
 * Formats a duration string (in seconds) into a readable format
 * @param durationString Duration in seconds as a string
 * @returns Formatted duration string (e.g., "2min 30s" or "45s")
 */
export function getFormattedDuration(durationString: string): string | null {
  const totalSeconds = parseInt(durationString, 10);

  if (isNaN(totalSeconds)) {
    return null;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Extracts CSS variables starting with "--gencl" from the "gen-sdk-class" element.
 * These variables are used for theming and styling consistency across the application.
 * @returns Record of CSS variable names and their values
 */
// Constant for the gencl class name to avoid hardcoding
const GENCL_CLASS_NAME = "gen-sdk-class";

// Cache for genclVars to avoid repeated expensive lookups
let cachedGenclVars: Record<string, string> | null = null;

export function getGenclStyles(): Record<string, string> {
  // Guard for SSR and client-side safety
  if (typeof document === "undefined") return {};

  // Return cached result if available
  if (cachedGenclVars) return cachedGenclVars;

  const element = document.getElementsByClassName(GENCL_CLASS_NAME)[0];
  if (!element) return {};

  const computedStyles = window.getComputedStyle(element);

  // Get all CSS variables from style attribute directly
  const styleAttribute = element.getAttribute("style") || "";

  // Create a dictionary of all CSS custom properties (variables) that start with "--gencl"
  const genclVars = {} as Record<string, string>;

  // Most direct approach: Parse the style attribute for inline styles
  // This captures what's explicitly set on the element
  const styleRegex = /(--gencl[^:]+):\s*([^;]+)/g;
  let match: RegExpExecArray | null;
  while ((match = styleRegex.exec(styleAttribute)) !== null) {
    const propName = match[1];
    const value = match[2];
    if (propName && value) {
      genclVars[propName] = value.trim();
    }
  }

  // Also capture CSS variables from computed styles
  // This is the most reliable way to get all variables
  // including those from stylesheets and parent elements
  Array.from(computedStyles)
    .filter((propName) => propName.startsWith("--gencl"))
    .forEach((propName) => {
      const value = computedStyles.getPropertyValue(propName).trim();
      if (value) {
        genclVars[propName] = value;
      }
    });

  // Additional check for known CSS variable patterns
  const cssVarPatterns = [
    "--gencl-color-primary",
    "--gencl-color-secondary",
    "--gencl-color-tertiary",
  ];

  // Try all patterns with different variants (100, 200, 300, etc.)
  for (const baseVar of cssVarPatterns) {
    for (let i = 100; i <= 900; i += 100) {
      const varName = `${baseVar}-${i}`;
      const value = computedStyles.getPropertyValue(varName).trim();
      if (value) {
        genclVars[varName] = value;
      }
    }
  }

  // Cache the result for future calls
  cachedGenclVars = genclVars;

  return genclVars;
}
