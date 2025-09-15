import { cn } from "@genuin/ui/lib/utils";

type ResizeHandleProps = {
  side: "left" | "right";
  onMouseDown: (e: React.MouseEvent) => void;
  showTimeLabel: boolean;
  timeLabel: string;
};

export function ResizeHandle({
  side,
  timeLabel,
  showTimeLabel,
  onMouseDown,
}: ResizeHandleProps) {
  const isRight = side === "right";

  return (
    <div
      data-handle={side}
      className={cn(
        "gencl:min-w-[12px] gencl:h-full gencl:bg-secondary-900 gencl:cursor-ew-resize gencl:relative gencl:z-30 gencl:flex gencl:items-center gencl:justify-center",
        isRight ? "gencl:rounded-r" : "gencl:rounded-l"
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
    >
      <div className="gencl:w-[2px] gencl:h-[28px] gencl:bg-white gencl:rounded-full gencl:shrink-0" />
      {showTimeLabel && (
        <div className="gencl:absolute gencl:-bottom-6.5 gencl:left-1/2 gencl:-translate-x-1/2 gencl:text-white gencl:text-body-2-semi-bold gencl:px-1 gencl:py-0.5 gencl:rounded-sm gencl:bg-secondary-900">
          {timeLabel}
        </div>
      )}
    </div>
  );
}
