import { ControlLayerPropsType } from "./control-layer.types";
import { type FC, lazy, Suspense } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

const IHeartControlLayer = lazy(() =>
  import("./embed/iheart").then((module) => ({
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
        <Suspense fallback={null}>
          <IHeartControlLayer
            postDetails={postDetails}
            className={className}
            isActive={isActive}
            onReactionStateChange={onReactionStateChange}
            {...restProps}
          />
        </Suspense>
      );

    case "default":
    default:
      return (
        <Suspense fallback={null}>
          <DefaultPlacement
            postDetails={postDetails}
            className={className}
            isActive={isActive}
            onReactionStateChange={onReactionStateChange}
            {...restProps}
          />
        </Suspense>
      );
  }
};
