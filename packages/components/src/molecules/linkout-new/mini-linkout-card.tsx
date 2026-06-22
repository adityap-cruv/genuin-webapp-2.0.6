import { Image } from "@genuin/ui/components/image";
import { ChevronRight } from "lucide-react";

import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

/**
 * Compact horizontal mini linkout card from Figma node 4845-149889.
 * Sibling variant of `<StandaloneLinkout>` / `<ResponsiveLinkCard>` —
 * shares the `LinkData` type but has a different visual shape than
 * the responsive card's square-thumb output:
 *
 * - 60×81 px portrait thumbnail on the left (image fills, not square).
 * - Tight 8 px padding, 16 px gap.
 * - 1 px secondary-150 border (no fill background).
 * - Title (`body-1-semi-bold`), small subtitle from `description`
 *   (`body-3-medium`), and a Learn More pill (matches Figma
 *   4912-148245).
 *
 * Use this when a row needs a fixed compact card — e.g. a side rail
 * of advertiser content next to a video. For the responsive
 * size-bucket-driven card, use `<StandaloneLinkout>` /
 * `<DynamicLinkouts view="responsive">` instead.
 */
export interface MiniLinkoutCardProps {
  /** Single linkout to render. */
  link: LinkData;
  /** Override the Learn More label. Defaults to `"Learn More"`. */
  ctaText?: string;
  /** Override the CTA href. Defaults to `link.link`. */
  ctaLink?: string;
  /** Optional click handler on the CTA pill. */
  onCtaClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Extra classes merged onto the card root. */
  className?: string;
}

export function MiniLinkoutCard({
  link,
  ctaText = "Learn More",
  ctaLink,
  onCtaClick,
  className,
}: MiniLinkoutCardProps) {
  const href = ctaLink ?? link.link;
  const title = link.title ?? link.link;
  return (
    <article
      data-slot="mini-linkout-card"
      className={`gencl:flex gencl:items-start gencl:gap-4 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-2${
        className ? ` ${className}` : ""
      }`}>
      <div className="gencl:relative gencl:h-[81px] gencl:w-[60px] gencl:shrink-0 gencl:overflow-hidden gencl:rounded-lg gencl:shadow-xs">
        {link.image ? (
          <Image
            src={link.image}
            alt=""
            useWebp={false}
            className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
          />
        ) : (
          <div className="gencl:size-full gencl:bg-secondary-100" />
        )}
      </div>
      <div className="gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:gap-1">
        <p className="gencl:line-clamp-1 gencl:text-body-1-semi-bold gencl:text-secondary-900">{title}</p>
        {link.description && (
          <p className="gencl:line-clamp-1 gencl:text-body-3-medium gencl:text-secondary-700">{link.description}</p>
        )}
        {/* Learn More pill — Figma 4912-148245. */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCtaClick}
          className="gencl:mt-1 gencl:inline-flex gencl:h-10 gencl:w-fit gencl:items-center gencl:gap-2 gencl:rounded-lg gencl:border gencl:border-primary-200 gencl:py-0.5 gencl:pl-3 gencl:pr-2 gencl:text-body-1-semi-bold gencl:text-secondary-900 gencl:no-underline">
          {ctaText}
          <ChevronRight className="gencl:size-6 gencl:text-secondary-900" />
        </a>
      </div>
    </article>
  );
}
