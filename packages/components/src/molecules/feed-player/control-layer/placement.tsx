import { type FC, lazy } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

import type { ControlLayerPropsType } from "./control-layer.types";

const IHeartControlLayer = lazy(() =>
  import("./embed/iheart/index").then((module) => ({
    default: module.IHeartControlLayer,
  }))
);

const DefaultPlacement = lazy(() =>
  import("./placement/default-placement").then((module) => ({
    default: module.DefaultPlacement,
  }))
);

export const Placement: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  onReactionStateChange,
  ...restProps
}) => {
  const { view } = useEmbedConfigs();
  const brandLayoutType = view.brandLayoutType;

  switch (brandLayoutType) {
    case "iheart":
      return (
        <SafeSuspense fallback={null} errorFallback={null}>
          <IHeartControlLayer
            postDetails={postDetails}
            className={className}
            isActive={isActive}
            onReactionStateChange={onReactionStateChange}
            {...restProps}
          />
        </SafeSuspense>
      );

    case "default":
    default:
      return (
        <SafeSuspense fallback={null} errorFallback={null}>
          <DefaultPlacement
            postDetails={postDetails}
            className={className}
            isActive={isActive}
            onReactionStateChange={onReactionStateChange}
            {...restProps}
          />
        </SafeSuspense>
      );
  }
};
