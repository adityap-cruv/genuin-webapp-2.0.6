import React from "react";

import { cn } from "@genuin/ui/lib/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "../link";

// Utility function to apply line clamp styles to an element
export function applyLineClampStyles(
  element: HTMLElement,
  maxLines: number | null,
  display: "inline" | "block"
) {
  if (maxLines === null) {
    element.style.display = display === "inline" ? "inline" : "-webkit-box"; // Reset display
    (
      element.style as unknown as {
        webkitLineClamp?: string;
        webkitBoxOrient?: string;
      }
    ).webkitLineClamp = "";
    (
      element.style as unknown as {
        webkitLineClamp?: string;
        webkitBoxOrient?: string;
      }
    ).webkitBoxOrient = "vertical";
    element.style.overflow = "hidden"; // Reset overflow
    element.style.textOverflow = "ellipsis"; // Reset text-overflow
  } else {
    element.style.display = display === "inline" ? "inline" : "-webkit-box";
    (
      element.style as unknown as {
        webkitLineClamp?: string;
        webkitBoxOrient?: string;
      }
    ).webkitLineClamp = `${maxLines}`;
    (
      element.style as unknown as {
        webkitLineClamp?: string;
        webkitBoxOrient?: string;
      }
    ).webkitBoxOrient = "vertical";
    element.style.overflow = "hidden";
    element.style.textOverflow = "ellipsis";
  }
}

interface AnchorTagBase {
  type: "url" | "member" | "community" | "custom";
  text: string;
}

interface UrlAnchorTag extends AnchorTagBase {
  type: "url";
  url: string;
}

interface MemberAnchorTag extends AnchorTagBase {
  type: "member";
}

interface CommunityAnchorTag extends AnchorTagBase {
  type: "community";
  slug: string;
}

interface CustomAnchorTag extends AnchorTagBase {
  type: "custom";
  text: string;
  style: React.CSSProperties;
  className?: string;
}

export type AnchorTagType =
  | UrlAnchorTag
  | MemberAnchorTag
  | CommunityAnchorTag
  | CustomAnchorTag
  | string
  | null;

// Utility function to convert URLs, mentions, and slugs to anchor tag data objects (for rendering in React)
export function convertUrlsToAnchorTags(
  strArr: Array<Record<string, unknown> | string | null>
): AnchorTagType[] {
  return strArr.map((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "url" in item &&
      "text" in item
    ) {
      return { type: "url", url: String(item.url), text: String(item.text) };
    }
    if (
      typeof item === "object" &&
      item !== null &&
      "member_id" in item &&
      "text" in item
    ) {
      return {
        type: "member",
        member_id: String(item.member_id),
        text: String(item.text),
      };
    }
    if (
      typeof item === "object" &&
      item !== null &&
      "slug" in item &&
      "text" in item
    ) {
      return {
        type: "community",
        slug: String(item.slug),
        text: String(item.text),
      };
    }
    if (
      typeof item === "object" &&
      item !== null &&
      "text" in item &&
      "style" in item
    ) {
      return {
        type: "custom",
        style: item.style as React.CSSProperties,
        text: String(item.text),
        className: String(item.className),
      };
    }
    if (typeof item === "string" || item === null) return item;
    return null;
  });
}

/**
 * Renders an anchor tag based on the provided item type
 * @param item - The anchor tag item to render
 * @param index - The index of the item in the list
 * @param whiteLabelUrl - Optional URL to use as base for community/profile links in embed mode
 * @param redirectionFlag - Whether the component is being used in embed mode
 * @returns React node containing the rendered anchor tag
 */
export function renderAnchorTag(
  item: AnchorTagType,
  index: number
): React.ReactNode {
  // Handle primitive types
  if (typeof item === "string" || item === null) {
    return item;
  }

  // Validate item structure
  if (typeof item !== "object" || !item?.type) {
    return null;
  }

  const commonProps = {
    className: cn("gencl:text-primary"),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  switch (item.type) {
    case "url": {
      const href = item.url.startsWith("http")
        ? item.url
        : `https://${item.url.replace(/^\/+/g, "")}`;

      return (
        <Link key={`${item.type}-${index}`} href={href} {...commonProps}>
          {item.text}
        </Link>
      );
    }

    case "custom": {
      return (
        <span style={item.style} className={item.className}>
          {item.text}
        </span>
      );
    }

    case "member": {
      const username = item.text.slice(1);
      const href = buildPageUrl({ type: "profile", slug: username });

      return (
        <Link key={`${item.type}-${index}`} href={href} {...commonProps}>
          {item.text}
        </Link>
      );
    }

    case "community": {
      const href = buildPageUrl({ type: "community", slug: item.slug });
      return (
        <Link key={`${item.type}-${index}`} href={href} {...commonProps}>
          {item.text}
        </Link>
      );
    }

    default:
      return null;
  }
}

/**
 * Safely parses a JSON string **only if** it represents an object or an array.
 *
 * This function avoids parsing JSON strings that represent primitive values
 * such as strings, numbers, booleans, or null. If the input is not valid JSON
 * or is a primitive value, the original input string is returned.
 */
export function safeJsonParse(input: string): any {
  try {
    const parsed = JSON.parse(input);

    // Only parse if it's an object or array, not a primitive like string, number, boolean, etc.
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }

    // If it's a primitive (like a string), return the original input
    return input;
  } catch (e) {
    // If JSON.parse throws (invalid JSON), return the original input
    return input;
  }
}

/**
 * Calculate maximum character limit based on device type and position
 * @param {boolean} isMobile - Whether the device is mobile
 * @param {string} position - Position type ('overlay' or other)
 * @param {number} maxChars - Optional override for max characters
 * @returns {number} Maximum character limit
 */
export const calculateMaxCharacterLimit = (
  isMobile: boolean,
  position: "overlay" | "outside",
  maxChars = null
) => {
  // If maxChars is provided, use it directly
  if (maxChars) {
    return maxChars;
  }

  // Define character limits for different scenarios
  const characterLimits = {
    mobile: {
      overlay: 90,
      default: 80,
    },
    desktop: {
      overlay: 180,
      default: 90,
    },
  };

  const deviceType = isMobile ? "mobile" : "desktop";

  const positionType = position === "overlay" ? "overlay" : "default";

  return characterLimits[deviceType][positionType];
};
