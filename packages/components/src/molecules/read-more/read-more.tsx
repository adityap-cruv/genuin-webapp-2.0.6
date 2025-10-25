"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@genuin/ui/lib/utils";

import {
  applyLineClampStyles,
  calculateMaxCharacterLimitCached,
  calculateMaxHeight,
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
  maxChars,
  maxLines = 2,
  maxWidth = "100%",
  showExpandText = true,
  shouldAnimate = false,
  position = "outside",
  expandable = true,
  display = "block",
  className,
  textClassName,
  buttonClassName,
  viewMoreText = "View More",
  viewLessText = "View Less",
  expandedHeight = "40vh",
  useDynamicHeight,
  showBottomOverlay = false,
  onClick,
  defaultExpand = false,
  onExpandChange,
  open,
  href,
  linkClassName,
  lineClampClassName,
  showOverlay = false,
  overlayClassName,
  ...rest
}: ReadMoreProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpand);
  // For smooth collapse: delay reducing chars until after animation
  const [showCollapsed, setShowCollapsed] = useState(!defaultExpand);
  const [maxCharacter, setCalculatedMaxChars] = useState<number>(maxChars ?? 0);
  const [measuredHeight, setMeasuredHeight] = useState("0px");
  const [maskState, setMaskState] = useState({ bottom: true, top: false });
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

  // Calculate max characters after mount when ref is available
  // Added shouldAnimate dependency to recalculate after animation styles are applied
  useEffect(() => {
    if (!maxChars && textRef.current && flattenedText) {
      // Use requestAnimationFrame to ensure all styles and layout are applied
      const rafId = requestAnimationFrame(() => {
        // Double RAF to ensure layout is complete
        requestAnimationFrame(() => {
          if (textRef.current) {
            const limit = calculateMaxCharacterLimitCached(
              maxLines,
              textRef.current,
              flattenedText,
              showExpandText
                ? viewMoreText.length > viewLessText.length
                  ? viewMoreText
                  : viewLessText
                : ""
            );
            setCalculatedMaxChars(limit);
          }
        });
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [
    maxChars,
    flattenedText,
    maxLines,
    viewLessText,
    viewMoreText,
    shouldAnimate,
    showExpandText,
  ]);

  useEffect(() => {
    if (!useDynamicHeight) return;
    const height = calculateMaxHeight(textRef.current, 5);
    setMeasuredHeight(height);
  }, [useDynamicHeight]);

  // Memoize text splitting for performance
  const textParts = useMemo(() => {
    if (!parsedText || flattenedText.length <= maxCharacter) {
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
        if (teaserLen + wordLen > maxCharacter) break;
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

        if (charCount + itemText.length > maxCharacter) {
          const remainingChars = maxCharacter - charCount;
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
  }, [parsedText, flattenedText, maxCharacter]);

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
    if (!textRef.current) return;
    const textElement = textRef.current;
    applyLineClampStyles(textElement, isExpanded ? null : maxLines, display);
  }, [maxLines, isExpanded, display]);

  // Modified animation logic for smooth expand/collapse and delayed char reduction
  useEffect(() => {
    if (!shouldAnimate || !textRef.current) return;

    const textElement = textRef.current;

    if (textElement && !isExpanded) {
      applyLineClampStyles(textElement, maxLines, display);
      setShowCollapsed(false);
    } else {
      applyLineClampStyles(textElement, null, display);
      setShowCollapsed(true);
    }
  }, [shouldAnimate, isExpanded, maxLines]);

  useEffect(() => {
    if (typeof open === "undefined") return;
    setIsExpanded(open);
  }, [open]);

  // Handle scroll to show/hide mask image based on scroll position
  useEffect(() => {
    if (!shouldAnimate || !expandable || !showBottomOverlay) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollThreshold = 10; // pixels from bottom/top
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Show bottom mask if not near bottom and content is scrollable
      const shouldShowBottomMask =
        distanceFromBottom > scrollThreshold && scrollHeight > clientHeight;
      setMaskState((prev) => ({
        ...prev,
        bottom: shouldShowBottomMask,
      }));

      // Show top mask if scrolled down (not at top)
      const shouldShowTopMask = scrollTop > scrollThreshold;
      setMaskState((prev) => ({
        ...prev,
        top: shouldShowTopMask,
      }));
    };

    // Initial check
    handleScroll();

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Also check on resize in case content changes
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [shouldAnimate, expandable, showBottomOverlay, isExpanded]);

  // Reset mask visibility when expanding/collapsing
  useEffect(() => {
    if (isExpanded && showBottomOverlay) {
      // Small delay to allow layout to settle
      const timer = setTimeout(() => {
        const container = containerRef.current;
        if (container) {
          const { scrollHeight, clientHeight } = container;
          setMaskState({
            bottom: scrollHeight > clientHeight,
            top: false, // Reset to top when expanding
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setMaskState({ bottom: false, top: false });
    }
  }, [isExpanded, showBottomOverlay]);

  const clampedStyle: React.CSSProperties = {
    display: display === "inline" ? "inline" : "-webkit-box",
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-word",
  };

  // Memoize toggle function
  const toggleExpand = useCallback(() => {
    if (!textParts.shouldTruncate || !expandable) return;
    setIsExpanded((prevValue: boolean) => {
      onExpandChange?.(!prevValue);
      return !prevValue;
    });
  }, [onExpandChange, textParts, expandable]);

  // Handle overlay click - only close if expanded
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isExpanded) {
        setIsExpanded(false);
        onExpandChange?.(false);
      }
    },
    [isExpanded, onExpandChange]
  );

  // Memoize height calculations
  const heights = useMemo(
    () => ({
      collapsed: `${maxLines * 24}px`,
      expanded: useDynamicHeight ? measuredHeight : expandedHeight,
    }),
    [maxLines, expandedHeight, measuredHeight, useDynamicHeight]
  );

  // Memoize display text generation
  const displayText = useMemo(() => {
    const { teaser, remaining, shouldTruncate } = textParts;

    if (!shouldTruncate) {
      // If shouldAnimate and not expanded, add 3 dots at the end
      if (shouldAnimate && !isExpanded && showCollapsed && !showExpandText) {
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
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Show less content" : "Show more content"}
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
      if (shouldAnimate && showCollapsed && !showExpandText) {
        return (
          <>
            {teaserContent}
            <span className="gencl:whitespace-nowrap align-baseline">…</span>
          </>
        );
      }
      // During animation, show full text (no truncation)
      if (shouldAnimate && !showCollapsed && !showExpandText) {
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
    if (shouldAnimate && !showExpandText) {
      return (
        <>
          <span
            className={cn(
              "gencl:max-h-[10em] gencl:opacity-100 gencl:text-inherit",
              lineClampClassName
            )}
          >
            {renderText(teaser)}
            {renderText(remaining)}
          </span>
        </>
      );
    }

    return (
      <>
        <span
          className={cn(
            "gencl:max-h-[10em] gencl:opacity-100 gencl:text-inherit",
            lineClampClassName
          )}
        >
          {renderText(teaser)}
          {renderText(remaining)}
          {showExpandText && <span>&nbsp;{createButton(viewLessText)}</span>}
        </span>
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

  const renderBlockContent = (
    <div className="gencl:w-full gencl:overflow-clip" style={{ maxWidth }}>
      <p
        {...rest}
        ref={containerRef}
        className={cn(
          "gencl:transition-all gencl:relative gencl:duration-500 gencl:ease-in-out gencl:overflow-auto gencl:scrollbar-none gencl:w-full",
          "swiper-no-swiping",
          className
        )}
        style={{
          maxHeight:
            shouldAnimate && expandable
              ? isExpanded
                ? heights.expanded
                : heights.collapsed
              : undefined,
          overflow: shouldAnimate && expandable ? "auto" : undefined,
          transition:
            shouldAnimate && expandable
              ? "max-height 0.5s cubic-bezier(0.4,0,0.2,1), -webkit-mask-image 0.3s ease-in-out, mask-image 0.3s ease-in-out"
              : undefined,
          ...(isExpanded &&
            showBottomOverlay && {
              WebkitMaskImage: `
                linear-gradient(to bottom, transparent 0%, black ${maskState.top ? "30%" : "0%"}, black ${maskState.bottom ? "70%" : "100%"}, transparent 100%)
              `.trim(),
              maskImage: `
                linear-gradient(to bottom, transparent 0%, black ${maskState.top ? "30%" : "0%"}, black ${maskState.bottom ? "70%" : "100%"}, transparent 100%)
              `.trim(),
            }),
          ...rest.style,
        }}
        onClick={(e) => {
          if (!textParts.shouldTruncate) return;
          if (!expandable) return;
          e.stopPropagation();
          onClick?.(e);
          setIsExpanded((prev) => {
            onExpandChange?.(!prev);
            return !prev;
          });
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
            !shouldAnimate && !isExpanded && expandable
              ? clampedStyle
              : { wordBreak: "break-word" }
          }
        >
          {displayText}
        </span>
      </p>
    </div>
  );

  const renderInlineContent = (
    <span className="gencl:w-full gencl:overflow-clip" style={{ maxWidth }}>
      <span
        {...rest}
        className={cn(
          "gencl:transition-all gencl:relative gencl:duration-500 gencl:ease-in-out gencl:overflow-auto gencl:scrollbar-none gencl:w-full",
          className
        )}
        style={{
          maxHeight:
            shouldAnimate && expandable
              ? isExpanded
                ? heights.expanded
                : heights.collapsed
              : undefined,
          overflow: shouldAnimate && expandable ? "auto" : undefined,
          transition:
            shouldAnimate && expandable
              ? "max-height 0.5s cubic-bezier(0.4,0,0.2,1)"
              : undefined,
          ...rest.style,
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
            !shouldAnimate && !isExpanded && expandable
              ? clampedStyle
              : { wordBreak: "break-word" }
          }
        >
          {displayText}
        </span>
      </span>
    </span>
  );

  // Wrap content in link if href is provided
  const finalContent = href ? (
    <a
      href={href}
      className={cn(
        "gencl:cursor-pointer hover:gencl:underline focus:gencl:outline-none gencl:w-full",
        linkClassName
      )}
    >
      {display === "inline" ? renderInlineContent : renderBlockContent}
    </a>
  ) : display === "inline" ? (
    renderInlineContent
  ) : (
    renderBlockContent
  );

  return (
    <div
      className={cn(
        "gencl:relative",
        display === "inline" && "gencl:inline"
        // showOverlay && isExpanded && "gencl:z-10"
      )}
    >
      {/* Overlay backdrop */}
      {showOverlay && expandable && textParts.shouldTruncate && isExpanded && (
        <div
          className={cn(
            "gencl:fixed gencl:inset-0 gencl:bg-black/40 gencl:transition-opacity gencl:duration-300",
            isExpanded
              ? "gencl:opacity-100 gencl:pointer-events-auto"
              : "gencl:opacity-0 gencl:pointer-events-none",
            overlayClassName
          )}
          onClick={handleOverlayClick}
        />
      )}
      {finalContent}
    </div>
  );
});
