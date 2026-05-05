import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

const ctaButtonVariants = cva(
  [
    "gencl:w-full gencl:h-10 gencl:rounded-lg",
    "gencl:flex gencl:items-center gencl:justify-between",
    "gencl:px-4 gencl:text-body-0-semi-bold",
  ],
  {
    variants: {
      theme: {
        light: ["gencl:bg-secondary-100 gencl:text-black", "gencl:hover:bg-secondary-150"],
        dark: ["gencl:bg-black gencl:text-white", "gencl:hover:bg-black/90"],
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

const ctaIconVariants = cva("gencl:size-5 gencl:shrink-0", {
  variants: {
    theme: {
      light: "gencl:text-black",
      dark: "gencl:text-white",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

export type CTAButtonProps = {
  /**
   * The URL to navigate to when clicked
   */
  link: string;
  /**
   * The text to display on the button
   */
  text: string;
  /**
   * Callback when the button is clicked
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Whether to show the chevron icon
   */
  showIcon?: boolean;
  /**
   * A key that, when changed, triggers the text transition animation.
   * Pass `activeLinkIndex` (or any value that changes with the content)
   * so the fade+slide plays on every cycle update.
   */
  animationKey?: string | number;
} & VariantProps<typeof ctaButtonVariants> &
  Omit<ComponentProps<"button">, "onClick">;

/**
 * CTAButton - A reusable call-to-action button component
 * Used in linkouts as the main CTA at the bottom of the link list
 *
 * When `animationKey` changes the inner text fades out upward then
 * fades in from below, giving a smooth slot-machine feel instead of
 * an abrupt text swap.
 *
 * Design matches Figma Sprint 39-41 (node: 3205:325254)
 */
export function CTAButton({
  link,
  text,
  onClick,
  showIcon = true,
  theme = "light",
  className,
  animationKey,
  ...restProps
}: CTAButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
  };

  return (
    <>
      {/* Keyframe definition — injected once, harmless if duplicated */}
      <style>{`
        @keyframes cta-slide-in {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cta-animate {
          animation: cta-slide-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <Button
        className={cn(ctaButtonVariants({ theme }), className)}
        onClick={handleClick}
        theme="custom"
        {...restProps}>
        {/*
         * The key prop forces React to unmount + remount the span every time
         * animationKey changes, which restarts the CSS animation from scratch.
         * overflow-hidden on the wrapper clips the entering/exiting frame.
         */}
        <span className="gencl:flex-1 gencl:overflow-hidden">
          <span
            key={animationKey}
            className="cta-animate gencl:block gencl:text-left gencl:truncate gencl:line-clamp-1">
            {text ?? link}
          </span>
        </span>

        {showIcon && <ChevronRight className={ctaIconVariants({ theme })} />}
      </Button>
    </>
  );
}
