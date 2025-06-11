import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@genuin/ui/lib/utils";

import {
  applyLineClampStyles,
  convertUrlsToAnchorTags,
  renderAnchorTag,
  safeJsonParse,
} from "./utils";

export type ReadMoreTextType =
  | string
  | null
  | Array<Record<string, unknown> | string | null>;

export type ReadMoreProps = {
  /**
   * The text content to display. Can be a string or an array of objects for rich text.
   */
  text?: ReadMoreTextType;
  /**
   * Maximum number of characters to show before truncation.
   * Only used when truncateBy is 'characters'
   */
  maxChars?: number;
  /**
   * Maximum number of lines to show before truncation
   * @default 1
   */
  maxLines?: number;
  /**
   * Maximum width of the component container
   * @default '100%'
   */
  maxWidth?: string | number;
  /**
   * Whether to show the "View more/less" button
   * @default true
   */
  showExpandText?: boolean;
  /**
   * Whether to animate the expansion/collapse
   * @default false
   */
  shouldAnimate?: boolean;
  /**
   * The position of the text relative to its container
   * @default 'outside'
   */
  position?: "overlay" | "outside";
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Custom class name for the text content
   */
  textClassName?: string;
  /**
   * Custom class name for the view more/less button
   */
  buttonClassName?: string;
  /**
   * Custom text for the "View more" button
   * @default "(View more)"
   */
  viewMoreText?: string;
  /**
   * Custom text for the "View less" button
   * @default "(View less)"
   */
  viewLessText?: string;
  /**
   * Height of the expanded view
   * @default "500px"
   */
  expandedHeight?: string;
  /**
   * Default Configuration to Open Expanded or not
   * @default false
   */
  defaultExpand?: boolean;
  /**
   * Callback of Parent if there is already Expanded
   */
  onExpandChange?: (isExpanded: boolean) => void;
  /**
   * Boolean value for the explicitly manage the state of parent for expansion
   */
  open?: boolean;
} & Omit<ComponentProps<"p">, "children">;

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

export function ReadMore({
  text,
  maxChars = 150,
  maxLines = 1,
  maxWidth = "100%",
  showExpandText = true,
  shouldAnimate = false,
  position = "outside",
  className,
  textClassName,
  buttonClassName,
  viewMoreText = "(View more)",
  viewLessText = "(View less)",
  expandedHeight = "500px",
  onClick,
  defaultExpand = false,
  onExpandChange,
  open,
  ...props
}: ReadMoreProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpand);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [truncatedText, setTruncatedText] = useState<string>("");

  // Only stringify text when it changes
  const stringifiedText = useMemo(() => JSON.stringify(text), [text]);

  // Process text content for rich text support
  const processedText = useMemo<React.ReactNode>(() => {
    if (!stringifiedText) return null;

    let textObj: unknown;
    if (typeof stringifiedText === "string") {
      try {
        textObj = safeJsonParse(stringifiedText);
      } catch {
        textObj = stringifiedText;
      }
    }

    const anchorDataArr = Array.isArray(textObj)
      ? convertUrlsToAnchorTags(
          textObj as Array<Record<string, unknown> | string | null>
        )
      : textObj;

    return Array.isArray(anchorDataArr)
      ? anchorDataArr.map((item, idx) => renderAnchorTag(item, idx))
      : String(textObj);
  }, [stringifiedText]);

  // Handle text truncation for maxChars
  useEffect(() => {
    if (typeof stringifiedText === "string" && !isExpanded) {
      const shouldTruncate = stringifiedText.length > maxChars;
      setTruncatedText(shouldTruncate ? stringifiedText.slice(0, maxChars) + "..." : stringifiedText);
    } else {
      setTruncatedText("");
    }
  }, [stringifiedText, maxChars, isExpanded]);

  // Handle line-based truncation
  useEffect(() => {
    if (!textRef.current) return;
    const textElement = textRef.current;
    applyLineClampStyles(textElement, isExpanded ? null : maxLines);
  }, [maxLines, processedText, isExpanded]);

  // Check for text overflow
  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (!element || !stringifiedText) return;

      const lineHeight = parseInt(getComputedStyle(element).lineHeight);
      const height = element.scrollHeight;
      const maxHeight = lineHeight * maxLines;
      const isTextOverflowing =
        typeof stringifiedText === "string" && stringifiedText.length > maxChars;
      setIsOverflowing(height > maxHeight || isTextOverflowing);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
      onExpandChange?.(open ?? false);
    };
  }, [stringifiedText, maxLines, maxChars]);

  // Calculate collapsed height based on line height and maxLines
  const getCollapsedHeight = () => {
    return `${maxLines * 24}px`;
  };

  // Calculate expanded height based on content
  const getExpandedHeight = () => {
    return `${parseInt(expandedHeight) * 0.2}px`;
  };

  // Modified animation logic
  useEffect(() => {
    if (!shouldAnimate || !textRef.current) return;

    const textElement = textRef.current;
    if (isExpanded) {
      applyLineClampStyles(textElement, null);
      return;
    }

    const timeoutId = setTimeout(() => {
      applyLineClampStyles(textElement, maxLines);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isExpanded, shouldAnimate, maxLines]);

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

  const toggleExpand = () => {
    setIsExpanded((prevValue: boolean) => {
      onExpandChange?.(!prevValue);
      return !prevValue;
    });
  };

  const displayText =
    typeof processedText === "string" && !isExpanded
      ? truncatedText
      : processedText;

  if (!stringifiedText || stringifiedText.length === 0) return null;

  return (
    <div className="gencl:w-full gencl:overflow-clip" style={{ maxWidth }}>
      <p
        {...props}
        className={cn(
          "gencl:transition-all gencl:duration-500 gencl:ease-in-out",
          {
            "gencl:swiper-no-swiping gencl:hide-scrollbar gencl:overflow-auto":
              isExpanded,
          },
          className
        )}
        style={{
          height: shouldAnimate
            ? isExpanded
              ? getExpandedHeight()
              : getCollapsedHeight()
            : undefined,
        }}
        onClick={(e) => {
          onClick?.(e);
          e.stopPropagation();
        }}
      >
        <span
          ref={textRef}
          className={cn(
            "gencl:w-full gencl:break-words",
            position !== "outside" && "gencl:text-white",
            textClassName
          )}
          style={
            !shouldAnimate && !isExpanded
              ? clampedStyle
              : { wordBreak: "break-word" }
          }
          onClick={
            !showExpandText && isOverflowing
              ? (e) => {
                  e.stopPropagation();
                  toggleExpand();
                }
              : undefined
          }
        >
          {displayText}
        </span>
        {showExpandText && isOverflowing && (
          <button
            type="button"
            className={cn(
              "gencl:mt-1 gencl:text-primary gencl:hover:underline",
              buttonClassName
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {isExpanded ? viewLessText : viewMoreText}
          </button>
        )}
      </p>
    </div>
  );
}
