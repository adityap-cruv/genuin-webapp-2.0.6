import { Button } from "@genuin/ui/button";
import { toast, toastError } from "@genuin/ui/components/toaster";
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
    const url = new URL(window.location.href);
    url.pathname = pathName;
    const success = await copy(url.href);

    if (success) {
      toast("Link copied to clipboard!");
    } else {
      toastError("Failed to copy link. Please try again.");
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
      <ShareIcon className="gencl:size-6" />
      {showText && "Share"}
    </Button>
  );
}
