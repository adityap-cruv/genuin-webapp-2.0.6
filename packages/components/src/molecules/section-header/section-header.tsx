import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps, CSSProperties, ElementType, ReactNode } from "react";

export type SectionHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  imageUrl?: string | null;
  imageAlt?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
  headingAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  headingStyle?: CSSProperties;
  subHeadingStyle?: CSSProperties;
};

/** Reusable image, heading, and sub-heading row for content sections. */
export function SectionHeader({
  imageUrl,
  imageAlt = "",
  heading,
  subHeading,
  headingAs = "h2",
  headingStyle,
  subHeadingStyle,
  className,
  ...restProps
}: SectionHeaderProps) {
  const Heading = headingAs as ElementType;

  if (!imageUrl && !heading && !subHeading) return null;

  return (
    <div
      data-slot="section-header"
      className={cn("gencl:flex gencl:w-full gencl:min-w-0 gencl:items-center gencl:gap-2", className)}
      {...restProps}>
      {imageUrl && (
        <div className="gencl:size-10 gencl:shrink-0 gencl:overflow-hidden gencl:rounded-lg">
          <Image
            src={imageUrl}
            alt={imageAlt}
            className="gencl:size-full gencl:object-cover"
            useWebp={false}
            handleError
          />
        </div>
      )}

      <div className="gencl:min-w-0">
        {heading && (
          <Heading
            data-slot="section-header-heading"
            className="gencl:text-body-0-semi-bold gencl:line-clamp-1"
            style={headingStyle}>
            {heading}
          </Heading>
        )}
        {subHeading && (
          <p
            data-slot="section-header-sub-heading"
            className="gencl:text-body-1-medium gencl:text-secondary-300 gencl:line-clamp-1"
            style={subHeadingStyle}>
            {subHeading}
          </p>
        )}
      </div>
    </div>
  );
}
