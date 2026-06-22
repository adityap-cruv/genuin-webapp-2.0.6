"use client";

import React from "react";

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
}

const LOGO_SIZE = { width: "24px", height: "24px" } as const;
const CHEVRON_SIZE = { width: "14px", height: "14px" } as const;

/**
 * Linkout CTA anchor — brand logo + caption + chevron.
 * Stops click propagation so it doesn't trigger the parent ClickOverlay.
 *
 * @param props.href - Click-through URL
 * @param props.caption - CTA label text (e.g. "Order Now", "Shop Now")
 * @param props.logoUrl - Brand/advertiser logo URL shown as a circular icon
 * @param props.style - Inline styles merged onto the outer anchor element
 */
export function LinkoutButton({ href, caption, logoUrl, style, onClick }: LinkoutButtonProps): React.JSX.Element {
  return (
    <a
      data-testid="linkout-btn"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-1 gencl:h-full gencl:flex-1 gencl:min-w-0 gencl:rounded-lg gencl:bg-black/80 gencl:cursor-pointer gencl:no-underline"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={style}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          className="gencl:rounded-sm gencl:shrink-0 gencl:object-cover"
          style={LOGO_SIZE}
        />
      )}
      <span className="gencl:text-white gencl:text-[14px] gencl:font-medium gencl:truncate gencl:flex-1 gencl:min-w-0">
        {caption}
      </span>
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
        style={CHEVRON_SIZE}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </a>
  );
}
