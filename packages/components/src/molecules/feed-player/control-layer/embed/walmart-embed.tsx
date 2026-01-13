import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "../control-layer.types";
import { type FC } from "react";
import { EmbedControls } from "../controls/embed";

export const WalmartEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  ...restProps
}) => {
  return (
    <div
      className={cn(
        "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between gencl:relative",
        className
      )}
      {...restProps}
    >
      {isActive ? (
        <EmbedControls
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "gencl:gap-2 gencl:z-20 gencl:absolute gencl:right-0 gencl:p-2"
          )}
          size="xs"
        />
      ) : (
        <></>
      )}

      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        <p className="gencl:text-body-1-semi-bold gencl:text-white gencl:line-clamp-1">
          {postDetails.section?.title}
        </p>
      </div>
    </div>
  );
};
