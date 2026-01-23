import { ControlLayerPropsType } from "./control-layer.types";
import { lazy, Suspense, type FC } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

const IHeartControlLayer = lazy(() =>
  import("./embed/iheart/index.js").then((m) => ({
    default: m.IHeartControlLayer,
  }))
);
const TedEmbed = lazy(() =>
  import("./embed/ted-embed.js").then((m) => ({ default: m.TedEmbed }))
);
const GrubhubEmbed = lazy(() =>
  import("./embed/grubhub-embed.js").then((m) => ({ default: m.GrubhubEmbed }))
);
const WalmartEmbed = lazy(() =>
  import("./embed/walmart-embed.js").then((m) => ({ default: m.WalmartEmbed }))
);
const ResponsivenessEmbed = lazy(() =>
  import("./embed/responsiveness-embed.js").then((m) => ({
    default: m.ResponsivenessEmbed,
  }))
);
const DefaultEmbed = lazy(() =>
  import("./embed/default-embed.js").then((m) => ({ default: m.DefaultEmbed }))
);

export const Embed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  onReactionStateChange,
  layoutType,
  ...restProps
}) => {
  const config = useEmbedConfigs();

  const brandLayoutType = !config.responsive.canShowEngagement
    ? "responsiveness"
    : config.view.brandLayoutType;

  return (
    <Suspense fallback={null}>
      {(() => {
        switch (brandLayoutType) {
          case "iheart":
            return (
              <IHeartControlLayer
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );

          case "ted":
            return (
              <TedEmbed
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );

          case "grubhub":
            return (
              <GrubhubEmbed
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );

          case "walmart":
            return (
              <WalmartEmbed
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );

          case "responsiveness":
            return (
              <ResponsivenessEmbed
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );

          case "default":
          default:
            return (
              <DefaultEmbed
                postDetails={postDetails}
                className={className}
                isActive={isActive}
                onReactionStateChange={onReactionStateChange}
                {...restProps}
              />
            );
        }
      })()}
    </Suspense>
  );
};
