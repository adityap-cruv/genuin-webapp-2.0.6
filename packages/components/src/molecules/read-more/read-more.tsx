"use client";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@genuin/ui/lib/utils";

import {
  applyLineClampStyles,
  convertUrlsToAnchorTags,
  renderAnchorTag,
} from "./utils";
import { tryJsonParse } from "@genuin/ui/lib/utils";
import type { ReadMoreProps, ReadMoreTextType } from "./read-more.types";
import { memo } from "react";

/**
 * ReadMore Component
 *
 * A flexible text truncation component that allows you to show/hide long text content with smooth animations and customizable behavior.
 *
 * @example
 * // Basic usage
 * <ReadMore
 *   text="Your long text here..."
 *   maxLines={2}
 *   maxWidth="400px"
 * />
 *
 * @example
 * // With animation
 * <ReadMore
 *   text="Your long text here..."
 *   maxLines={2}
 *   shouldAnimate={true}
 *   expandedHeight="200px"
 * />
 *
 * @example
 * // With external state control
 * const [isExpanded, setIsExpanded] = useState(false);
 * <ReadMore
 *   text="Your long text here..."
 *   defaultExpand={isExpanded}
 *   onExpandChange={setIsExpanded}
 * />
 *
 * @example
 * // With rich text support
 * <ReadMore
 *   text={[
 *     "Check out this ",
 *     { type: "url", url: "https://example.com", text: "awesome link" },
 *     " and follow ",
 *     { type: "member", text: "@username" }
 *   ]}
 *   maxLines={2}
 * />
 */
export const ReadMore = memo(function ReadMore({
  text,
  maxChars = 100,
  maxLines = 2,
  maxWidth = "100%",
  showExpandText = true,
  shouldAnimate = false,
  position = "outside",
  className,
  textClassName,
  buttonClassName,
  viewMoreText = "View More",
  viewLessText = "View Less",
  expandedHeight = "500px",
  onClick,
  defaultExpand = false,
  onExpandChange,
  open,
  href,
  linkClassName,
  ...rest
}: ReadMoreProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpand);
  // For smooth collapse: delay reducing chars until after animation
  const [showCollapsed, setShowCollapsed] = useState(!defaultExpand);

  // Memoize parsed text processing
  const parsedText = useMemo(() => {
    if (!text) return "";
    if (typeof text === "string") {
      // Try to parse if it's a stringified JSON
      const parsed = tryJsonParse(text);
      // If parsing was successful and returned an object/array, use it
      if (
        parsed !== text &&
        (Array.isArray(parsed) || (parsed && typeof parsed === "object"))
      ) {
        return parsed as ReadMoreTextType;
      }
      return text;
    }
    if (Array.isArray(text)) return text;
    return text;
  }, [text]);

  // Memoize flattened text for performance
  const flattenedText = useMemo(() => {
    if (typeof parsedText === "string") return parsedText;
    if (Array.isArray(parsedText)) {
      return parsedText
        .map((item) => {
          if (typeof item === "string") return item;
          if (item?.text && typeof item.text === "string") {
            return item.text;
          }
          return "";
        })
        .join(" ");
    }
    return "";
  }, [parsedText]);

  // Memoize text splitting for performance
  const textParts = useMemo(() => {
    if (!parsedText || flattenedText.length <= maxChars) {
      return { teaser: parsedText, remaining: null, shouldTruncate: false };
    }

    if (typeof parsedText === "string") {
      const words = parsedText.split(" ");
      const teaserWords: string[] = [];
      let teaserLen = 0;
      let i = 0;

      for (; i < words.length; i++) {
        const word = words[i] ?? "";
        const wordLen = word.length + (i === 0 ? 0 : 1);
        if (teaserLen + wordLen > maxChars) break;
        teaserWords.push(word);
        teaserLen += wordLen;
      }

      return {
        teaser: teaserWords.join(" "),
        remaining: words.slice(i).join(" "),
        shouldTruncate: true,
      };
    }

    if (Array.isArray(parsedText)) {
      const teaserArr: typeof parsedText = [];
      const remainingArr: typeof parsedText = [];
      let charCount = 0;
      let foundLimit = false;

      for (const item of parsedText) {
        if (foundLimit) {
          remainingArr.push(item);
          continue;
        }

        const itemText =
          typeof item === "string"
            ? item
            : item &&
                typeof item === "object" &&
                "text" in item &&
                typeof item.text === "string"
              ? item.text
              : "";

        if (charCount + itemText.length > maxChars) {
          const remainingChars = maxChars - charCount;
          if (remainingChars > 0 && typeof item === "string") {
            teaserArr.push(item.slice(0, remainingChars));
            remainingArr.push(item.slice(remainingChars));
          } else {
            remainingArr.push(item);
          }
          foundLimit = true;
        } else {
          teaserArr.push(item);
          charCount += typeof itemText === "string" ? itemText.length : 0;
        }
      }

      return {
        teaser: teaserArr,
        remaining: remainingArr,
        shouldTruncate: true,
      };
    }

    return { teaser: parsedText, remaining: null, shouldTruncate: false };
  }, [parsedText, flattenedText, maxChars]);

  // Memoize text rendering for performance
  const renderText = useCallback((input: ReadMoreTextType) => {
    if (typeof input === "string") return input;
    if (Array.isArray(input)) {
      // Convert to anchor tags format and render properly
      const anchorTags = convertUrlsToAnchorTags(input);
      return anchorTags.map((item, idx) => renderAnchorTag(item, idx));
    }
    return null;
  }, []);

  // Handle line-based truncation
  useEffect(() => {
    if (!textRef.current || shouldAnimate) return;
    const textElement = textRef.current;
    applyLineClampStyles(textElement, isExpanded ? null : maxLines);
  }, [maxLines, isExpanded, shouldAnimate]);

  // Modified animation logic for smooth expand/collapse and delayed char reduction
  useEffect(() => {
    if (!shouldAnimate || !textRef.current) return;

    const textElement = textRef.current;

    // Remove line clamp before animating both expand and collapse
    applyLineClampStyles(textElement, null);

    let timeout: NodeJS.Timeout | undefined;
    if (!isExpanded) {
      // Wait for animation, then re-apply clamp and reduce chars
      timeout = setTimeout(() => {
        if (!isExpanded && textRef.current) {
          applyLineClampStyles(textRef.current, maxLines);
          setShowCollapsed(true);
        }
      }, 500);
      // During animation, keep full text visible
      setShowCollapsed(false);
    } else {
      // On expand, immediately show full text
      setShowCollapsed(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [shouldAnimate, isExpanded, maxLines]);

  useEffect(() => {
    if (typeof open === "undefined") return;
    setIsExpanded(open);
  }, [open]);

  const clampedStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
  };

  // Memoize toggle function
  const toggleExpand = useCallback(() => {
    setIsExpanded((prevValue: boolean) => {
      onExpandChange?.(!prevValue);
      return !prevValue;
    });
  }, [onExpandChange]);

  // Memoize height calculations
  const heights = useMemo(
    () => ({
      collapsed: `${maxLines * 24}px`,
      expanded: expandedHeight,
    }),
    [maxLines, expandedHeight]
  );

  // Memoize display text generation
  const displayText = useMemo(() => {
    const { teaser, remaining, shouldTruncate } = textParts;

    if (!shouldTruncate) {
      // If shouldAnimate and not expanded, add 3 dots at the end
      if (shouldAnimate && !isExpanded && showCollapsed) {
        return (
          <>
            {renderText(parsedText)}
            <span className="gencl:whitespace-nowrap align-baseline">…</span>
          </>
        );
      }
      // If shouldAnimate and expanded, do not show 3 dots
      return renderText(parsedText);
    }

    const createButton = (text: string) => (
      <button
        type="button"
        className={cn(
          "gencl:inline gencl:bg-transparent gencl:!text-secondary-600 gencl:hover:underline gencl:cursor-pointer",
          buttonClassName
        )}
        style={{
          padding: 0,
          margin: 0,
          background: "none",
          border: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
      >
        {text}
      </button>
    );

    if (!isExpanded) {
      const teaserContent =
        typeof teaser === "string"
          ? teaser.replace(/\s*$/, "")
          : renderText(teaser);

      // If shouldAnimate, only show teaser after animation completes
      if (shouldAnimate && showCollapsed) {
        return (
          <>
            {teaserContent}
            <span className="gencl:whitespace-nowrap align-baseline">…</span>
          </>
        );
      }
      // During animation, show full text (no truncation)
      if (shouldAnimate && !showCollapsed) {
        return renderText(parsedText);
      }

      return (
        <>
          {teaserContent}
          {showExpandText && (
            <span className="gencl:whitespace-nowrap align-baseline">
              &nbsp;…
              {createButton(viewMoreText)}
            </span>
          )}
        </>
      );
    }

    // If shouldAnimate and expanded, do not show 3 dots
    if (shouldAnimate) {
      return (
        <>
          {renderText(teaser)}
          <span className="gencl:max-h-[10em] gencl:opacity-100 gencl:text-inherit">
            {renderText(remaining)}
          </span>
        </>
      );
    }

    return (
      <>
        {renderText(teaser)}
        <span className="gencl:max-h-[10em] gencl:opacity-100 gencl:text-inherit">
          {renderText(remaining)}
        </span>
        {showExpandText && createButton(viewLessText)}
      </>
    );
  }, [
    textParts,
    isExpanded,
    showCollapsed,
    showExpandText,
    viewMoreText,
    viewLessText,
    buttonClassName,
    toggleExpand,
    renderText,
    parsedText,
    shouldAnimate,
  ]);

  // Early return if no text
  if (!flattenedText || flattenedText.length === 0) return null;

  const content = (
    <div className="gencl:w-full gencl:overflow-clip" style={{ maxWidth }}>
      <p
        {...rest}
        className={cn(
          "gencl:transition-all gencl:relative gencl:duration-500 gencl:ease-in-out",
          className
        )}
        style={{
          maxHeight: shouldAnimate
            ? isExpanded
              ? "40vh"
              : heights.collapsed
            : undefined,
          overflow: shouldAnimate ? "auto" : undefined,
          transition: shouldAnimate
            ? "max-height 0.5s cubic-bezier(0.4,0,0.2,1)"
            : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
          setIsExpanded((prev) => !prev);
        }}
      >
        <span
          ref={textRef}
          className={cn(
            "gencl:w-full gencl:break-words",
            position !== "outside"
              ? "gencl:text-white!"
              : "gencl:text-secondary-900",
            textClassName
          )}
          style={
            !shouldAnimate && !isExpanded
              ? clampedStyle
              : { wordBreak: "break-word" }
          }
        >
          {displayText}
        </span>
      </p>
    </div>
  );

  // If href is provided, wrap the content in a link
  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "gencl:cursor-pointer hover:gencl:underline focus:gencl:outline-none",
          linkClassName
        )}
      >
        {content}
      </a>
    );
  }

  return content;
});
