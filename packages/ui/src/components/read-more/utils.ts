import React from "react";

import { cn, tryJsonParse } from "@genuin/ui/lib/utils";

// Define PATH_NAME locally since it's used in the component
const PATH_NAME = {
  profile: (username: string) => `/profile/${username}`,
  community: (slug: string) => `/community/${slug}`,
};

// Utility function to apply line clamp styles to an element
export function applyLineClampStyles(
  element: HTMLElement,
  maxLines: number | null
) {
  if (maxLines === null) {
    element.style.display = ""; // Reset display
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
    ).webkitBoxOrient = "";
    element.style.overflow = ""; // Reset overflow
    element.style.textOverflow = ""; // Reset text-overflow
  } else {
    element.style.display = "-webkit-box";
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
  type: "url" | "member" | "community";
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

export type AnchorTagType =
  | UrlAnchorTag
  | MemberAnchorTag
  | CommunityAnchorTag
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
    if (typeof item === "string" || item === null) return item;
    return null;
  });
}

/**
 * Renders an anchor tag based on the provided item type
 * @param item - The anchor tag item to render
 * @param index - The index of the item in the list
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
    key: `${item.type}-${index}`,
    className: cn("gencl:text-primary"),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  switch (item.type) {
    case "url": {
      const href = item.url.startsWith("http")
        ? item.url
        : `https://${item.url.replace(/^\/+/g, "")}`;

      return React.createElement(
        "a",
        {
          ...commonProps,
          href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        item.text
      );
    }

    case "member": {
      const username = item.text.slice(1);
      return React.createElement(
        "a",
        {
          ...commonProps,
          href: PATH_NAME.profile(username),
        },
        item.text
      );
    }

    case "community": {
      return React.createElement(
        "a",
        {
          ...commonProps,
          href: PATH_NAME.community(item.slug),
        },
        item.text
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
