import { Button } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { ShareIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { useCallback } from "react";
import { useCopyToClipboard } from "usehooks-ts";

import { useBaseContext, useLinkContext } from "@genuin/components/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

type ShareButtonProps = {
  showText?: boolean;
  /**
   * pass the path name of the page to be shared.
   * host will be taken from the current window location.
   */
  pathName: string;
  /**
   * with custom children, the button will not render the default icon and text.
   */
  withCustomChildren?: boolean;
  /**
   * Optional title to use when sharing on mobile
   */
  title?: string;
  /**
   * Optional description to use when sharing on mobile
   */
  description?: string;
  /**
   * Disable internal share functionality (copy to clipboard, native share, toast)
   * When true, the button will only trigger the onClick prop without any built-in actions
   */
  disableInternalFunctionality?: boolean;
} & React.ComponentProps<typeof Button>;

export function ShareButton({
  showText = false,
  pathName,
  size,
  theme,
  withCustomChildren = false,
  variant,
  className,
  children,
  title,
  description,
  disableInternalFunctionality = false,
  onClick,
  ...restProps
}: ShareButtonProps) {
  const [, copy] = useCopyToClipboard();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const { createExternalLink } = useLinkContext();
  const { brandDetails } = useBaseContext();
  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();

  const handleClick = useCallback(
    async (e: any) => {
      onClick?.(e);

      // Build the share URL with smart parameter handling
      const buildShareUrl = (): string => {
        // TODO : remove temporary check of ted brand id.
        const baseShareUrl = pathName ? pathName.split("/video") : [];
        const initialUrl =
          (brandDetails.brand_id === 2357 && baseShareUrl && baseShareUrl.length === 2
            ? window.location.href
            : pathName) ?? pathName;

        const url = new URL(createExternalLink(initialUrl));

        // Handle TED brand special case (brand_id 2357)
        if (brandDetails.brand_id === 2357 && baseShareUrl[1]) {
          const videoPath = baseShareUrl[1].split("?")[0];
          url.searchParams.set("video", videoPath?.slice(1) ?? "");
        }

        // Add or update utm_source for tracking
        url.searchParams.set("utm_source", "web");

        // Add share_image_id from current URL if present and not already in share URL
        const currentUrlParams = new URLSearchParams(window.location.search);
        const shareImageId = currentUrlParams.get("share_image_id");
        if (shareImageId && !url.searchParams.has("share_image_id")) {
          url.searchParams.set("share_image_id", shareImageId);
        }

        return url.href;
      };

      // If internal functionality is disabled, only trigger onClick and return
      if (disableInternalFunctionality) {
        const fullUrl = buildShareUrl();
        await copy(fullUrl);
        return;
      }

      const fullUrl = buildShareUrl();

      const toastPosition = brandLayoutType === "iheart" ? "bottom-center" : undefined;

      const toastMessage = brandLayoutType === "iheart" ? "Link copied to clipboard" : "Link Copied";

      // For mobile/tablet devices, use native share API if available
      if (!isDesktop && navigator.share) {
        try {
          // Check if we're in an embed context
          const isEmbed = window.location.href.includes("embed");

          if (isEmbed) {
            window.open(fullUrl, "_blank", "noopener,noreferrer");
            return;
          }

          await navigator.share({
            url: fullUrl,
            title: title,
            text: description,
          });
          // If sharing is successful, we don't need to do anything else
        } catch (error: any) {
          // Don't show error if user simply canceled/dismissed the share dialog
          // AbortError is thrown when user dismisses the share dialog
          if (error.name === "AbortError") {
            // User canceled the share, do nothing
            return;
          }

          // For other errors, fallback to clipboard
          const success = await copy(fullUrl);
          if (success) {
            Toast.Success({
              message: toastMessage,
              isIheart: brandLayoutType === "iheart",
            });
          } else {
            Toast.Error({
              message: "Failed to copy link. Please try again.",
              isIheart: brandLayoutType === "iheart",
            });
          }
        }
      } else {
        // For desktop, use clipboard
        const success = await copy(fullUrl);
        if (success) {
          Toast.Success({
            message: toastMessage,
            isIheart: brandLayoutType === "iheart",
          });
        } else {
          Toast.Error({
            message: "Failed to copy link. Please try again.",
            isIheart: brandLayoutType === "iheart",
          });
        }
      }
    },
    [
      copy,
      pathName,
      isDesktop,
      title,
      description,
      createExternalLink,
      brandLayoutType,
      disableInternalFunctionality,
      onClick,
    ]
  );

  if (withCustomChildren) {
    return (
      <span onClick={handleClick} className={cn("gencl:cursor-pointer", className)}>
        {children}
      </span>
    );
  }

  return (
    <Button
      size={size ?? "md"}
      theme={theme ?? "secondary"}
      className={cn(className)}
      variant={(variant ?? !showText) ? "icon" : "default"}
      onClick={handleClick}
      {...restProps}>
      <ShareIcon className="gencl:size-6 gencl:shrink-0" />
      {showText && "Share"}
    </Button>
  );
}
