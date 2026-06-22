import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidHTTPS(link: string) {
  return link.startsWith("http") || link.startsWith("https") ? link : null;
}

/**
 * Opens a URL with maximum compatibility across browsers and iOS.
 * Uses a programmatic <a> tag click to bypass popup blockers reliably.
 */
export function openUrlInNewTab(url: string, target: "_blank" | "_self" = "_blank"): void {
  // Create a temporary anchor element
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = target;

  // Only add noopener noreferrer for new tabs (security best practice)
  if (target === "_blank") {
    anchor.rel = "noopener noreferrer";
  }

  // Append to body (required for Firefox)
  document.body.appendChild(anchor);

  // Trigger click programmatically
  anchor.click();

  // Clean up by removing the element
  document.body.removeChild(anchor);
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
  if (url.includes(".webp")) return url;
  return url;
  // return url.includes("/uploads/")
  //   ? url.replace(/(\/)([^/]+)\.([^/.]+)$/, "$1webp/$2.webp")
  //   : url;
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
  // Normalize the input to a number of milliseconds
  const createdAtNum = Number(createdAt);

  // If createdAt cannot be parsed, return an empty string to avoid showing invalid values
  if (isNaN(createdAtNum)) return "0m";

  const now = Date.now();
  const createdAtTime = new Date(createdAtNum).getTime();

  // If createdAt is invalid as a date, return an empty string
  if (isNaN(createdAtTime)) return "0m";

  // Compute difference in milliseconds. If createdAt is in the future, clamp to 0 so we don't show negative times like '-1m'
  let timeDifference = now - createdAtTime;
  if (timeDifference < 0) timeDifference = 0;
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

  const rounded = shortValue % 1 !== 0 ? shortValue.toFixed(1) : shortValue.toString();
  const result = (value < 0 ? "-" : "") + rounded + suffixes[suffixNum];
  return result;
};

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
  return link?.startsWith("http") || link?.startsWith("https") ? link : "https://" + link;
}

/**
 * Returns an object containing default sizes for icons in different sizes.
 */
export function defaultSizesForIcons() {
  return {
    xxs: "gencl:size-2",
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
 * Formats a timestamp into a month-day-year string
 * If the date is today, returns "Today"
 * Always shows full date in "MMM dd, yyyy" format
 * @param timestamp Unix timestamp in seconds or milliseconds
 * @returns Formatted date string or "Today"
 */
export function getMonthYear(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new Error("Invalid timestamp");
  }

  const timestampMs = timestamp > 1e10 ? timestamp : timestamp * 1000;
  const date = new Date(timestampMs);
  const now = new Date();

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a duration string (in seconds) into a readable format
 * @param durationString Duration in seconds as a string
 * @returns Formatted duration string (e.g., "1hr 30min", "2min 30sec", or "45sec")
 */
export function getFormattedDuration(durationString: string): string | null {
  const totalSeconds = parseInt(durationString, 10);

  if (isNaN(totalSeconds)) {
    return null;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${hours} hr`;
    }
  } else if (minutes > 0) {
    return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} min`;
  } else {
    return `${seconds} sec`;
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
  const cssVarPatterns = ["--gencl-color-primary", "--gencl-color-secondary", "--gencl-color-tertiary"];

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

/*
 * This function returns past tense of given word(should be verb).
 * @param word
 * @returns
 */
export function getPastTense(word: string) {
  if (/e$/.test(word)) {
    // If the word already ends in 'e', just add 'd'
    return word + "d";
  } else if (/[^aeiou]y$/.test(word)) {
    // If the word ends in a consonant + 'y', replace 'y' with 'ied'
    return word.slice(0, -1) + "ied";
  } else if (/([aeiou])([^aeiou])$/.test(word)) {
    // If the word ends in vowel + consonant, double the consonant and add 'ed'
    return word + word.slice(-1) + "ed";
  } else {
    // For most cases, just add 'ed'
    return word + "ed";
  }
}

/**
 * Parses an aspect ratio string (e.g. "9:16") and returns width and height values.
 * If the input is invalid or missing, defaults to 9:16.
 *
 * @param ratio - Aspect ratio string in the format "width:height" (e.g. "16:9", "4:3").
 * @returns An object with numeric width and height values.
 * @example
 * getAspectRatio("16:9") // { width: 16, height: 9 }
 * getAspectRatio() // { width: 9, height: 16 }
 */
export function getAspectRatio(ratio?: string): {
  width: number;
  height: number;
} {
  let width = 9;
  let height = 16;
  if (ratio) {
    const parts = ratio.split(":");
    if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
      const parsedWidth = parseInt(parts[0] as string, 10);
      const parsedHeight = parseInt(parts[1] as string, 10);
      if (!isNaN(parsedWidth) && !isNaN(parsedHeight) && parsedWidth > 0 && parsedHeight > 0) {
        width = parsedWidth;
        height = parsedHeight;
      }
    }
  }
  return { width, height };
}

/**
 * Detects if accessibility mode is active based on browser accessibility preferences
 * and assistive technology indicators.
 *
 * @returns {boolean} True if any accessibility indicators are detected
 */
export function detectAccessibilityMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Check for various accessibility indicators
  const accessibilityChecks = [
    // User prefers reduced motion
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    // User prefers high contrast
    window.matchMedia?.("(prefers-contrast: high)")?.matches,
    // User prefers reduced transparency
    window.matchMedia?.("(prefers-reduced-transparency: reduce)")?.matches,
    // Check if screen reader or other assistive technology is detected
    navigator.userAgent?.includes("JAWS") ||
      navigator.userAgent?.includes("NVDA") ||
      navigator.userAgent?.includes("SCREENREADER") ||
      // Check for Windows High Contrast mode
      window.matchMedia?.("(-ms-high-contrast: active)")?.matches ||
      // Check for forced colors (Windows high contrast, dark mode, etc.)
      window.matchMedia?.("(forced-colors: active)")?.matches,
  ];

  return accessibilityChecks.some(Boolean);
}

export function getTabindexElementsInViewport(container?: HTMLElement | null) {
  // Define the root element to search within
  const root = container || document;

  // Get all focusable elements (not just tabindex="0")
  const focusableSelector = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]:not([tabindex="-1"])',
  ].join(", ");

  const elements = root.querySelectorAll<HTMLElement>(focusableSelector);

  // Filter to only those that are truly visible
  const visibleElements = Array.from(elements).filter((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    // Check if element has size and is visible
    const hasSize = rect.width > 0 && rect.height > 0;

    // Check CSS visibility properties
    const isVisible =
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      element.offsetParent !== null; // checks if element or parent has display:none

    // If container is provided, check if element is within container bounds
    // Otherwise, check if element is in viewport
    let inBounds = true;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      inBounds =
        rect.top >= containerRect.top &&
        rect.left >= containerRect.left &&
        rect.bottom <= containerRect.bottom &&
        rect.right <= containerRect.right;
    } else {
      // Check if element is in viewport
      inBounds =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }

    return hasSize && isVisible && inBounds;
  });

  // Sort elements by their tabindex and DOM order
  const sortedElements = visibleElements.sort((a, b) => {
    const aTabIndex = a.getAttribute("tabindex");
    const bTabIndex = b.getAttribute("tabindex");
    const aIndex = aTabIndex ? parseInt(aTabIndex, 10) : 0;
    const bIndex = bTabIndex ? parseInt(bTabIndex, 10) : 0;

    // Elements with positive tabindex come first, in numerical order
    if (aIndex > 0 && bIndex > 0) return aIndex - bIndex;
    if (aIndex > 0) return -1;
    if (bIndex > 0) return 1;

    // For elements with tabindex 0 or no tabindex, maintain DOM order
    return 0;
  });

  // Return detailed information about each element
  return sortedElements.map((element, index) => {
    const rect = element.getBoundingClientRect();
    return {
      index: index,
      tagName: element.tagName,
      id: element.id || null,
      className: element.className || null,
      text: element.innerText?.substring(0, 50) || null,
      tabIndex: element.getAttribute("tabindex") || "default",
      position: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      },
      element: element,
    };
  });
}
