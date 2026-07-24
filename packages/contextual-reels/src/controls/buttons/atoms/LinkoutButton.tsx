"use client";

import React from "react";

import { safeHref } from "@cxr/utils/safeHref";

export interface LinkoutButtonProps {
  /** Click-through URL — renders as an anchor tag. */
  href: string;
  /** CTA label text (e.g. "Order Now", "Shop Now"). */
  caption: string;
  /** Brand/advertiser logo URL shown as a circular icon. */
  logoUrl?: string;
  /** Inline styles merged onto the outer anchor element. */
  style?: React.CSSProperties;
  /** Optional click handler from the ad SDK — called in addition to the default href navigation. */
  onClick?: () => void;
  /**
   * 'md' (default) matches the 320×100 actions row; 'sm' fits the 320×50
   * compact row. 'xs' is a caption-only variant (no logo, no chevron, capped
   * width) for slots too tight even for 'sm' — e.g. replacing the Watch
   * button in the 320×50 row.
   */
  size?: "xs" | "sm" | "md";
}

const LOGO_SIZE = { md: { width: "24px", height: "24px" }, sm: { width: "18px", height: "18px" } } as const;
const CHEVRON_SIZE = { md: { width: "14px", height: "14px" }, sm: { width: "12px", height: "12px" } } as const;
const CAPTION_TEXT_CLASS = {
  md: "gencl:text-[14px]",
  sm: "gencl:text-[11px]",
  xs: "gencl:text-[11px]",
} as const;
const ROOT_GAP_PADDING_CLASS = {
  md: "gencl:gap-2 gencl:px-1",
  sm: "gencl:gap-1 gencl:px-1",
  xs: "gencl:px-1.5",
} as const;

/**
 * Linkout CTA anchor — brand logo + caption + chevron ('md'/'sm'), or
 * caption-only ('xs'). Stops click propagation so it doesn't trigger the
 * parent ClickOverlay.
 *
 * @param props.href - Click-through URL
 * @param props.caption - CTA label text (e.g. "Order Now", "Shop Now")
 * @param props.logoUrl - Brand/advertiser logo URL shown as a circular icon (ignored for 'xs')
 * @param props.style - Inline styles merged onto the outer anchor element
 * @param props.size - 'md' (default), 'sm', or 'xs' (caption-only, capped width)
 */
export function LinkoutButton({
  href,
  caption,
  logoUrl,
  style,
  onClick,
  size = "md",
}: LinkoutButtonProps): React.JSX.Element {
  const isXs = size === "xs";
  return (
    <a
      data-testid="linkout-btn"
      // Sanitize: CTA urls come from untrusted ad/feed data — block javascript:/data: hrefs.
      href={safeHref(href)}
      target="_blank"
      rel="noopener noreferrer"
      className={`gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:min-w-0 gencl:rounded-lg gencl:bg-black/80 gencl:cursor-pointer gencl:no-underline ${
        isXs ? "gencl:max-w-17.5" : "gencl:flex-1"
      } ${ROOT_GAP_PADDING_CLASS[size]}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={style}>
      {!isXs && logoUrl && (
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          className="gencl:rounded-sm gencl:shrink-0 gencl:object-cover"
          style={LOGO_SIZE[size]}
        />
      )}
      <span
        className={`gencl:text-white gencl:font-medium gencl:truncate gencl:min-w-0 ${CAPTION_TEXT_CLASS[size]} ${
          isXs ? "" : "gencl:flex-1"
        }`}>
        {caption}
      </span>
      {!isXs && (
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="gencl:shrink-0"
          style={CHEVRON_SIZE[size]}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </a>
  );
}
