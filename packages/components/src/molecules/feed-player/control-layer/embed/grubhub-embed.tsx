import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "../control-layer.types";
import { type FC, lazy, Suspense } from "react";
import { PriceTagIcon } from "@genuin/ui/icons";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
) as React.ComponentType<any>;
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export const GrubhubEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  ...restProps
}) => {
  const config = useEmbedConfigs();

  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:justify-between",
        className
      )}
      {...restProps}
    >
      {postDetails.video.attributes?.offer_text && (
        <div className="gencl:absolute gencl:top-2 gencl:left-2 gencl:px-2 gencl:py-0.5 gencl:rounded-sm gencl:w-fit gencl:flex gencl:items-center gencl:gap-1 gencl:bg-[#AFE6CC]">
          <PriceTagIcon size="sm" theme="green" />
          <span className="gencl:text-body-2-medium gencl:m-0 gencl:p-0 gencl:text-[#0D8668]">
            {postDetails.video.attributes?.offer_text}
          </span>
        </div>
      )}

      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        {config.links.showLinkInside &&
          isActive &&
          postDetails.video.linkoutId && (
            <Suspense fallback={null}>
              <Linkouts
                variant="embed"
                isActive={isActive}
                showImmediately
                linkouts={postDetails.video.linkouts}
                linkoutId={postDetails.video.linkoutId}
              />
            </Suspense>
          )}
      </div>
    </div>
  );
};
