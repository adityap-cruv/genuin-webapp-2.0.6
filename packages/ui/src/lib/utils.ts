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
    : (process.env.NEXT_PUBLIC_CURRENT_ENV === "local"
        ? "http://"
        : "https://") + link;
}
