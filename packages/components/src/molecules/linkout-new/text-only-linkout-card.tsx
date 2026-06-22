import { ChevronRight } from "lucide-react";

import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

/**
 * Text-only linkout card. Sibling variant of `<StandaloneLinkout>` /
 * `<MiniLinkoutCard>` that drops the image area entirely — used when
 * the visual treatment that would normally sit in the image slot is
 * supplied separately by the host (for example, a sibling video
 * player rendered above the card).
 *
 * Renders: title (`body-1-semi-bold`), optional description
 * (`body-1-medium`), and a dark "Get Started" CTA pill matching
 * Figma 4840-153639.
 *
 * Use this when the standard image-on-top responsive card is too
 * heavy and the page composes its own preview element above the
 * text content.
 */
export interface TextOnlyLinkoutCardProps {
  /** Single linkout to render. */
  link: LinkData;
  /** CTA label. Defaults to `"Get Started"`. */
  ctaText?: string;
  /** Optional CTA href override. Defaults to `link.link`. */
  ctaLink?: string;
  /** Optional click handler on the CTA pill. */
  onCtaClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Extra classes merged onto the card root. */
  className?: string;
}

export function TextOnlyLinkoutCard({
  link,
  ctaText = "Get Started",
  ctaLink,
  onCtaClick,
  className,
}: TextOnlyLinkoutCardProps) {
  const href = ctaLink ?? link.link;
  return (
    <article
      data-slot="text-only-linkout-card"
      className={`gencl:flex gencl:flex-col gencl:gap-3 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-4${
        className ? ` ${className}` : ""
      }`}>
      <p className="gencl:text-body-1-semi-bold gencl:text-secondary-900">{link.title ?? link.link}</p>
      {link.description && <p className="gencl:text-body-1-medium gencl:text-secondary-700">{link.description}</p>}
      {/* Get Started — matches Figma 4840-153639. */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onCtaClick}
        className="gencl:inline-flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:rounded-lg gencl:bg-secondary-900 gencl:py-2 gencl:pl-4 gencl:pr-2 gencl:text-body-0-semi-bold gencl:text-white gencl:no-underline gencl:hover:bg-secondary-800">
        {ctaText}
        <ChevronRight className="gencl:size-6 gencl:text-white" />
      </a>
    </article>
  );
}
