import React from "react";

/** Animated skeleton shown while tag config or feed data is loading. */
export function FeedSkeleton(): React.JSX.Element {
  return (
    <div
      data-testid="cxr-skeleton"
      className="gencl:w-full gencl:h-full"
      style={{
        background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "cxr-shimmer 1.4s infinite",
      }}>
      <style>{`@keyframes cxr-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
