import React from "react";

import { cn } from "@genuin/ui/lib/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "../link";

// Utility function to apply line clamp styles to an element
export function applyLineClampStyles(
  element: HTMLElement,
  maxLines: number | null,
  display: "inline" | "block",
  isLineTruncate: boolean,
) {
  if (maxLines === null || !isLineTruncate) {
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
  strArr: Array<Record<string, unknown> | string | null>,
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
  index: number,
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
        <span
          key={`${item.type}-${index}`}
          style={item.style}
          className={item.className}
          tabIndex={-1}
          aria-hidden="true"
        >
          {item.text}&nbsp;
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
 * Calculates the maximum number of characters from `textContent` that can fit
 * within a given number of visible text lines (`maxLines`) inside the provided
 * DOM element (`element`), accounting for real-world CSS properties such as
 * font size, line height, padding, and width.
 *
 * This function uses an off-screen measurement container to simulate the
 * rendered text layout and iteratively determines the last character that fits
 * without exceeding the specified number of lines. It appends a suffix such as
 * "…View More" to match actual layout conditions when truncation is applied.
 *
 * ### Algorithm overview:
 * 1. Clone relevant computed styles (width, font, spacing, etc.) from the target element.
 * 2. Create a hidden measurement container off-screen.
 * 3. Incrementally append tokens (words and spaces) from `textContent` and check
 *    if the rendered height still fits within `maxLines`.
 * 4. Once overflow occurs, perform a character-level refinement to find the
 *    exact cutoff point.
 * 5. Return the number of visible characters that fit before truncation.
 *
 * ### Notes:
 * - This function measures layout in the DOM, so it should be called only in a
 *   browser environment (not SSR).
 * - It preserves all spaces and newlines using a whitespace-preserving split.
 * - For better performance when repeatedly called on the same element and text,
 *   use the cached variant: {@link calculateMaxCharacterLimitCached}.
 *
 * @param {number} maxLines - The maximum number of visible text lines allowed.
 * @param {HTMLElement | undefined} element - The DOM element whose width and styles are used for measurement.
 * @param {string} textContent - The text whose visible length should be measured.
 * @param {string} [viewMoreText="View More"] - The text appended at the end (e.g., for "View More" links).
 * @returns {number} The number of characters from `textContent` that fit within the given line limit.
 */
export function calculateMaxCharacterLimit(
  maxLines: number,
  element: HTMLElement | undefined,
  textContent: string,
  viewMoreText: string = "View More",
): number {
  if (!element || !textContent) return 0;

  const computedStyle = window.getComputedStyle(element);

  // Create measurement container (off-screen, but visible to layout)
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: -9999px;
    pointer-events: none;
    display: block;
    white-space: normal;
  `;

  // Copy relevant computed styles
  container.style.width = `${element.clientWidth}px`;
  container.style.fontFamily = computedStyle.fontFamily;
  container.style.fontSize = computedStyle.fontSize;
  container.style.fontWeight = computedStyle.fontWeight;
  container.style.fontStyle = computedStyle.fontStyle;
  container.style.lineHeight = computedStyle.lineHeight;
  container.style.letterSpacing = computedStyle.letterSpacing;
  container.style.wordSpacing = computedStyle.wordSpacing;
  container.style.textTransform = computedStyle.textTransform;
  container.style.wordBreak = computedStyle.wordBreak;
  container.style.overflowWrap = computedStyle.overflowWrap;
  container.style.whiteSpace = computedStyle.whiteSpace;
  container.style.paddingLeft = computedStyle.paddingLeft;
  container.style.paddingRight = computedStyle.paddingRight;
  container.style.boxSizing = computedStyle.boxSizing;

  // Create text and suffix spans
  const textSpan = document.createElement("span");
  const buttonSpan = document.createElement("span");
  buttonSpan.className = "gencl:whitespace-nowrap";
  buttonSpan.style.whiteSpace = "nowrap";
  textSpan.style.overflowWrap = "break-word";
  textSpan.style.wordBreak = "break-word"; // optional fallback
  textSpan.style.webkitLineClamp = maxLines.toString();
  textSpan.style.webkitBoxOrient = "vertical";

  container.appendChild(textSpan);
  container.appendChild(buttonSpan);
  document.body.appendChild(container);

  try {
    const suffix = `…${viewMoreText}`;
    buttonSpan.textContent = suffix;

    // Split text into tokens while preserving spaces and newlines
    const words = textContent.split(/(\s+)/);
    let resultString = "";
    let lastFitString = "";

    // Helper: checks if current text fits within maxLines using scrollHeight
    const fitsInLines = (text: string): boolean => {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      );

      if (isSafari) {
        textSpan.textContent = text;

        // Force reflow for Safari
        container.offsetHeight;

        // Use scrollHeight method (more reliable cross-browser)
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const actualLineHeight = isNaN(lineHeight)
          ? parseFloat(computedStyle.fontSize) * 1.2
          : lineHeight;

        const maxHeight = actualLineHeight * maxLines;
        const currentHeight = container.scrollHeight;

        // Add small tolerance for Safari's sub-pixel rendering
        return currentHeight <= maxHeight + 1;
      } else {
        textSpan.textContent = text + suffix;
        const range = document.createRange();
        range.selectNodeContents(textSpan);
        const rects = range.getClientRects();
        const lineCount = rects.length;
        range.detach();
        return lineCount <= maxLines;
      }
    };

    // Iteratively append text until overflow occurs
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word) continue;

      const testString = i === 0 ? word : `${resultString}${word}`;

      if (fitsInLines(testString)) {
        resultString = testString;
        lastFitString = resultString;
      } else {
        // Overflow occurred — refine by character
        let previousString = resultString;

        for (let charIndex = 0; charIndex < word.length; charIndex++) {
          const char = word[charIndex];
          const testStringWithChar =
            charIndex === 0 && i > 0
              ? `${previousString}${char}`
              : `${resultString}${char}`;
          console.log({ testStringWithChar, resultString });

          if (fitsInLines(testStringWithChar)) {
            resultString = testStringWithChar;
            lastFitString = resultString;
          } else {
            console.log({ resultString, textContent });
            return resultString.length === textContent.length
              ? resultString.length
              : resultString.length - viewMoreText.length;
          }
        }
      }
    }
    return resultString.length;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Cached version of {@link calculateMaxCharacterLimit}.
 *
 * This variant caches measurement results per unique combination of:
 * element width, font properties, line limit, suffix, and the first
 * 100 characters of the text. It is ideal for performance optimization
 * when called frequently on the same DOM element or with similar text.
 *
 * @param {number} maxLines - The maximum number of visible text lines allowed.
 * @param {HTMLElement | undefined} element - The DOM element used for measuring text layout.
 * @param {string} textContent - The text to measure.
 * @param {string} [viewMoreText="View More"] - The suffix appended to the text.
 * @returns {number} The number of characters that can fit within `maxLines`.
 */
export function calculateMaxCharacterLimitCached(
  maxLines: number,
  element: HTMLElement | undefined,
  textContent: string,
  viewMoreText: string = "View More",
): number {
  if (!element || !textContent) return 0;
  const computedStyle = window.getComputedStyle(element);
  const cacheKey = `${element.clientWidth}-${computedStyle.fontSize}-${computedStyle.fontFamily}-${maxLines}-${viewMoreText}-${textContent.substring(0, 100)}`;

  // Retrieve or initialize cache
  const cache = (element as any).__charLimitCache || {};
  if (cache[cacheKey] !== undefined) {
    return Math.min(cache[cacheKey], textContent.length);
  }

  // Compute and store result
  const result = calculateMaxCharacterLimit(
    maxLines,
    element,
    textContent,
    viewMoreText,
  );
  (element as any).__charLimitCache = { ...cache, [cacheKey]: result };

  return result;
}

/**
 * Calculates the maximum pixel height needed to display a given number of text lines
 * inside an HTML element, based on its computed line height.
 *
 * This is useful for responsive "Read More" or collapsible text components where
 * you want to show only a fixed number of lines (e.g., 3 or 5) before expanding.
 *
 * ---
 * Example use case:
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const [maxHeight, setMaxHeight] = useState("0px");
 *
 * useEffect(() => {
 *   if (ref.current) {
 *     setMaxHeight(calculateMaxHeight(ref.current, 5));
 *   }
 * }, []);
 *
 * return <div ref={ref} style={{ maxHeight, overflowY: 'auto' }}>Your text...</div>;
 * ```
 *
 * ---
 * @param {HTMLElement | null} element - The DOM element whose computed style should be used for measurement.
 * @param {number} maxLines - The number of visible lines before the text is truncated or scrollable.
 * @returns {string} - The calculated maximum height in pixels (e.g., `"100px"`).
 *
 * @example
 * // Given a paragraph with line-height of 20px
 * calculateMaxHeight(paragraphEl, 5);
 * // → "100px"
 *
 * ---
 * Notes:
 * - Handles cases where `line-height` is given in `px`, `normal`, or a unitless value like `1.5`.
 * - Falls back to a default multiplier (1.2) when line-height is `"normal"`.
 */
export function calculateMaxHeight(
  element: HTMLElement | null,
  maxLines: number,
): string {
  if (!element) return "0px";

  const computedStyle = window.getComputedStyle(element);
  const lineHeightValue = computedStyle.lineHeight;

  let lineHeightPx: number;

  if (lineHeightValue.endsWith("px")) {
    // Direct pixel value (e.g., "20px")
    lineHeightPx = parseFloat(lineHeightValue);
  } else {
    // Handle unitless or "normal" line-heights
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeightMultiplier =
      lineHeightValue === "normal" ? 1.2 : parseFloat(lineHeightValue);
    lineHeightPx = lineHeightMultiplier * fontSize;
  }

  const maxHeight = lineHeightPx * maxLines;
  return `${maxHeight}px`;
}
