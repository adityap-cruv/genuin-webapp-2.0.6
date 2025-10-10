import { Button } from "@genuin/ui/components/button";
import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useState } from "react";
import { getRedirectUrl } from "./utils";
import { IHeartPlayIcon } from "@genuin/ui/icons/iheart-icons";

interface CTAOnlyCardProps {
  isEmbed: boolean;
  ctaText: string;
  ctaLink: string;
  linkCount?: number;
  isDisabled?: boolean;
  showIcon?: boolean;
}

export const CTAOnlyCard = ({
  isEmbed,
  ctaText,
  ctaLink,
  linkCount = 0,
  isDisabled = false,
  showIcon = true,
}: CTAOnlyCardProps) => {
  const { track, EventName } = useAnalytics();
  const { brandDetails } = useBaseContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleCTAClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const url = checkAndAppendHttps(ctaLink);
      const finalUrl = await getRedirectUrl(url, brandDetails.brand_id);

      track(EventName.LINKOUTS_CTA_CLICKED, {
        linkUrl: ctaLink,
        linkCount,
      });

      window.open(finalUrl, "_blank");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      theme="custom"
      size={isEmbed ? "sm" : "md"}
      className={cn(
        "gencl:w-full gencl:h-9! gencl:text-body-1-semi-bold! gencl:font-semibold gencl:text-center gencl:justify-center gencl:transition-all gencl:text-white gencl:flex gencl:items-center gencl:px-3 gencl:rounded-full gencl:bg-primary gencl:hover:bg-primary-700",
        isDisabled &&
          "gencl:bg-[#3F4447]! gencl:text-[#A9AFB2]! gencl:cursor-not-allowed"
      )}
      style={{
        borderRadius: brandDetails.cta_config?.button_radius ?? "",
        background: brandDetails.cta_config?.button_color ?? "",
        color: brandDetails.cta_config?.text_color ?? "",
      }}
      onClick={handleCTAClick}
      disabled={isLoading}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-1">
        {showIcon && (
          <IHeartPlayIcon
            size="lg"
            theme="dark"
            className={cn(isDisabled && "gencl:fill-[#A9AFB2]!")}
          />
        )}
        <p
          className={cn(
            "gencl:line-clamp-1 gencl:truncate gencl:w-fit gencl:text-body-1-semi-bold!",
            isDisabled && "gencl:text-[#A9AFB2]!"
          )}
        >
          {brandDetails.cta_config?.default_button_text
            ? brandDetails.cta_config?.default_button_text
            : ctaText || "Full Episode"}
        </p>
      </div>
    </Button>
  );
};
