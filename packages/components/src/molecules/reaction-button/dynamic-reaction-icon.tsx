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
} & VariantProps<typeof reactionButtonVariant>;

export function DynamicReactionIcon({
  isSparked,
  theme,
  // showSparkCount = false,
  iconHeight = 32,
  // sparkCount = 0,
  iconWidth = 32,
  className,
}: DynamicReactionIconProps) {
  const {
    brandDetails: { reactions },
  } = useBaseContext();
  const iconToShow = useMemo(() => {
    const reaction = reactions;
    const forComment = theme === "light";

    // In case there is no reactions in config then we will show the spark icon.
    if (!reaction) return getUrlForReaction("spark", isSparked, forComment);

    if (forComment) {
      return isSparked
        ? reaction?.keys.comment_selected.svg
        : reaction?.keys.comment_unselected.svg;
    } else {
      return isSparked
        ? reaction?.keys.feed_selected.svg
        : reaction?.keys.feed_unselected.svg;
    }
  }, [reactions, isSparked, theme]);

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
