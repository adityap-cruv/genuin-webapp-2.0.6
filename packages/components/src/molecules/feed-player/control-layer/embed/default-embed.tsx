import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "../control-layer.types";
import { type FC } from "react";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { Stats } from "@genuin/components/molecules/stats";
import { PlayIcon } from "@genuin/ui/icons";
import { Controls } from "../controls/controls";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export const DefaultEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  ...restProps
}) => {
  const config = useEmbedConfigs();

  return (
    <div
      className={cn(
        "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between",
        className
      )}
      {...restProps}
    >
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        {config.links.showLinkInside && isActive && (
          <Linkouts
            variant="embed"
            isActive={isActive}
            showImmediately
            linkouts={postDetails.video.linkouts}
            linkoutId={postDetails.video.linkoutId}
          />
        )}
        {config.community.showViewCount && !isActive && (
          <Stats
            className="gencl:gap-1!"
            valueClassName="gencl:text-white!"
            stats={{
              Views: {
                value: 0,
                icon: <PlayIcon theme="dark" size="md" />,
              },
            }}
          />
        )}
      </div>

      {isActive && (
        <>
          <Controls
            variant="embed"
            ownerInfo={{ userName: postDetails.owner.userName }}
            showUserName={config.community.showUserName}
          />
        </>
      )}
    </div>
  );
};
