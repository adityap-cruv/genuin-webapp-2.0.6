import { cn } from "@genuin/ui/lib/utils";
import { BackButton } from "../player-swiper-buttons";

interface IHeartBackButtonProps {
  websiteType: string;
  isAdsEnabledInIheart: boolean;
  onBackClick: () => void;
  theme?: "light" | "dark";
}

export function IHeartBackButton({
  websiteType,
  isAdsEnabledInIheart,
  onBackClick,
  theme,
}: IHeartBackButtonProps) {
  return (
    <div
      className={cn(
        "gencl:absolute gencl:left-8 gencl:z-50",
        websiteType === "legacy" && isAdsEnabledInIheart
          ? "gencl:top-20! gencl:md:top-8!"
          : "gencl:top-8"
      )}
    >
      <BackButton
        websiteType={websiteType}
        onBackClick={onBackClick}
        theme={theme}
      />
    </div>
  );
}
