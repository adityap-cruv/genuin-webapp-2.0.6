import { Button } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { ShareIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { useCallback } from "react";
import { useCopyToClipboard } from "usehooks-ts";

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
  ...restProps
}: ShareButtonProps) {
  const [, copy] = useCopyToClipboard();

  const handleClick = useCallback(async () => {
    const videoPathName = pathName.split("/video")[1];
    // Build the URL string directly
    const baseUrl = window.location.origin;
    const fullPath = videoPathName ? "/video" + videoPathName : pathName;

    // Append UTM source parameter for tracking
    const url = new URL(fullPath, baseUrl);
    url.searchParams.append("utm_source", "web");
    let fullUrl = url.toString();

    // Check if share_image_id exists in the current URL
    if (window.location.href.includes('share_image_id=')) {
      const urlParams = new URLSearchParams(window.location.search);
      const shareImageId = urlParams.get('share_image_id');

      if (shareImageId && !fullUrl.includes('share_image_id=')) {
        // Add share_image_id to the shareLink
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}share_image_id=${shareImageId}`;
      }
    }

    const success = await copy(fullUrl);
    if (success) {
      Toast.Success({ message: "Link Copied" });
    } else {
      Toast.Error({ message: "Failed to copy link. Please try again." });
    }
  }, [copy, pathName]);

  if (withCustomChildren) {
    return (
      <span
        onClick={handleClick}
        className={cn("gencl:cursor-pointer", className)}
      >
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
      {...restProps}
    >
      <ShareIcon className="gencl:size-6 gencl:shrink-0" />
      {showText && "Share"}
    </Button>
  );
}
