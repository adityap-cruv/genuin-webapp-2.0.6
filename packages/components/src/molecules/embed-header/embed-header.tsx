import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import { useBaseContext } from "@genuin/components/context/base";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { ComponentProps } from "react";
import { Link } from "../link";
import { cva, VariantProps } from "class-variance-authority";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

const embedHeaderVariants = cva(
  "gencl:flex gencl:shrink-0 gencl:gap-2 gencl:w-full",
  {
    variants: {
      variant: {
        feed: "gencl:justify-start gencl:items-start gencl:flex-col",
        carousel: "gencl:justify-between gencl:items-center gencl:flex-row",
        standard_wall: "",
        grid: "gencl:justify-between gencl:items-center gencl:flex-row",
        dynamic: "",
        expand_only: "",
      },
    },
    defaultVariants: {
      variant: "carousel",
    },
  }
);

type EmbedHeaderPropsType = ComponentProps<"div"> &
  VariantProps<typeof embedHeaderVariants>;

/**
 * This component is used for embed only.
 *  */
export function EmbedHeader({
  className,
  variant,
  ...restProps
}: EmbedHeaderPropsType) {
  const { header } = useEmbedConfigs();
  const { brandDetails } = useBaseContext();
  const { track, EventName } = useAnalytics();

  // Use the header.showHeader property from our organized config
  if (!header.showHeader) return;

  return (
    <div
      className={cn(embedHeaderVariants({ variant }), "gencl:p-2")}
      {...restProps}
    >
      <div>
        {header.heading && (
          <p
            style={{ color: header.headingTextColor }}
            className={cn("gencl:text-body-1-semi-bold gencl:line-clamp-1")}
          >
            {header.heading}
          </p>
        )}
        {header.subHeading && (
          <p
            className="gencl:text-body-2-medium gencl:line-clamp-1"
            style={{
              color: header.subHeadingTextColor
                ? header.subHeadingTextColor
                : "var(--gencl-secondary-300)",
            }}
          >
            {header.subHeading}
          </p>
        )}
      </div>

      {header.ctaButton?.url && (
        <Link
          style={{
            color: header.ctaButton.textColor
              ? header.ctaButton.textColor
              : "white",
            backgroundColor: header.ctaButton.color
              ? header.ctaButton.color
              : "var(--gencl-primary-500)",
          }}
          onClick={() => {
            // Track the EMBED_CTA_CLICKED event when the CTA button is clicked
            track(EventName.EMBED_CTA_CLICKED, {
              redirection_url: header.ctaButton?.url,
              button_name: header.ctaButton?.text,
              brand_id: brandDetails?.brand_id,
              variant: variant,
            });
          }}
          className="gencl:whitespace-nowrap gencl:py-2 gencl:px-4 gencl:rounded-md gencl:text-body-1-demi"
          href={checkAndAppendHttps(header.ctaButton.url)}
          target="_blank"
        >
          {header.ctaButton.text}
        </Link>
      )}
    </div>
  );
}
