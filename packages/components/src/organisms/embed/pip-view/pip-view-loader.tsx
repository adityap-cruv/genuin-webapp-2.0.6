import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { lazy, Suspense, useEffect, useState } from "react";

const PipView = lazy(() =>
  import("./pip-view.js").then((m) => ({ default: m.PipView }))
);

type PipViewLoaderProps = {
  videos: PostDetailsType[];
  isLoading: boolean;
  totalVideos: number;
};

export function PipViewLoader({
  videos,
  isLoading,
  totalVideos,
}: PipViewLoaderProps) {
  const { embedEventBus } = useEmbedContext();
  const [isPipMode, setIsPipMode] = useState(
    embedEventBus.getContext().activePlayerType === "pip"
  );

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      _eventData: any,
      context: EmbedEventContextType
    ) => {
      setIsPipMode(context.activePlayerType === "pip");
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  if (!isPipMode) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PipView videos={videos} isLoading={isLoading} totalVideos={totalVideos} />
    </Suspense>
  );
}
