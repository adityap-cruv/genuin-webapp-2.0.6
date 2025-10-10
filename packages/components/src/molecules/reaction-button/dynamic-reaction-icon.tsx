import { useBaseContext } from "@genuin/components/context/base";
import { Image } from "@genuin/ui/image";
import { getUrlForReaction } from "@genuin/components/lib/utils";
import { useMemo } from "react";
import { cva, VariantProps } from "class-variance-authority";

const reactionButtonVariant = cva("", {
  variants: {
    theme: {
      dark: "",
      light: "",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

type DynamicReactionIconProps = {
  isSparked: boolean;
  sparkCount: number;
  showSparkCount?: boolean;
  iconHeight?: number;
  iconWidth?: number;
  className?: string;
  type: "feed" | "comment" | "social_count";
} & VariantProps<typeof reactionButtonVariant>;

export function DynamicReactionIcon({
  isSparked,
  theme,
  // showSparkCount = false,
  iconHeight = 32,
  // sparkCount = 0,
  iconWidth = 32,
  className,
  type = "feed",
}: DynamicReactionIconProps) {
  const {
    brandDetails: { reactions },
  } = useBaseContext();
  const iconToShow = useMemo(() => {
    const reaction = reactions;

    // In case there is no reactions in config then we will show the spark icon.
    if (!reaction)
      return getUrlForReaction("spark", isSparked, theme === "light");

    switch (type) {
      case "comment":
        return isSparked
          ? reaction?.keys.comment_selected.svg
          : reaction?.keys.comment_unselected.svg;
      case "feed":
        return isSparked
          ? reaction?.keys.feed_selected.svg
          : reaction?.keys.feed_unselected.svg;
      case "social_count":
        return theme === "dark"
          ? reaction?.keys.social_count_white.svg
          : reaction?.keys.social_count_black.svg;
      default:
        return getUrlForReaction("spark", isSparked, theme === "light");
    }
  }, [reactions, isSparked, theme, type]);

  return (
    <>
      <Image
        src={iconToShow}
        style={{ height: iconHeight, width: iconWidth }}
        height={iconHeight}
        width={iconWidth}
        alt="reaction"
        className={className}
      />
    </>
  );
}
