import { useBaseContext } from "@genuin/components/context/base";
import { Image } from "@genuin/ui/image";
import { abbreviateNumber } from "@genuin/ui/lib/utils";
import { getUrlForReaction } from "@genuin/components/lib/utils";
import { useMemo } from "react";

type DynamicReactionIconProps = {
  isSparked: boolean;
  variant: "dark" | "light";
  sparkCount: number;
  showSparkCount?: boolean;
  iconHeight?: number;
  iconWidth?: number;
  className?: string;
};

export function DynamicReactionIcon({
  isSparked,
  variant,
  showSparkCount = false,
  iconHeight = 32,
  sparkCount = 0,
  iconWidth = 32,
  className
}: DynamicReactionIconProps) {
  const {
    brandDetails: { reactions },
  } = useBaseContext();
  const iconToShow = useMemo(() => {
    const reaction = reactions;
    const forComment = variant === "light";

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
  }, [reactions, isSparked, variant]);

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
