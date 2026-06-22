import React from "react";

/** Shown when content is unavailable or the feed returned empty. */
export function NoContent({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      data-testid="cxr-no-content"
      className="gencl:w-full gencl:h-full gencl:flex gencl:items-center gencl:justify-center gencl:text-center gencl:px-3 gencl:box-border gencl:font-sans"
      style={{
        background: "#111",
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
      }}>
      {message}
    </div>
  );
}
