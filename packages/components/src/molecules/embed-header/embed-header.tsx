import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import { useBaseContext } from "@genuin/components/context/base";
import { ComponentProps } from "react";
import { Link } from "../link";
import { isCheckFifthVideoType } from "@genuin/components/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

const embedHeaderVariants = cva(
  "gencl:flex gencl:shrink-0 gencl:gap-2 gencl:w-full",
  {
    variants: {
      variant: {
        feed: "gencl:justify-start gencl:items-start gencl:flex-col",
        carousel: "gencl:justify-between gencl:items-center gencl:flex-row",
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

  // Use the header.showHeader property from our organized config
  if (!header.showHeader) return;

  return (
    <div
      className={cn(
        embedHeaderVariants({ variant }),
        // isCheckFifthVideoType(brandDetails?.brand_id) && variant === "carousel"
        //   ? "gencl:!p-0 gencl:!pb-3"
        //   : "gencl:p-2"
        "gencl:p-2"
      )}
      {...restProps}
    >
      <div>
        {header.heading && (
          <p
            style={{ color: header.headingTextColor }}
            className={cn("gencl:font-semibold gencl:line-clamp-1", {
              "gencl:!font-bold gencl:!text-[14px] gencl:!leading-[150%] gencl:!tracking-wide gencl:!uppercase":
                isCheckFifthVideoType(brandDetails?.brand_id) &&
                variant === "carousel",
            })}
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
                : "var(--secondary-300)",
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
              : "var(--primary-500)",
          }}
          onClick={() => {
            // TODO: ADD analytics tracking for CTA click
            // Analytics.track(Analytics.EventNames.EmbedCTAClicked, {
            //   redirection_url: header.ctaButton?.url,
            //   button_name: header.ctaButton?.text,
            // });
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
