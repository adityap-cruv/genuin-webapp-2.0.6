import { formatTime } from "./utils";

type TimelineBarProps = {
  duration: number;
  tickCount?: number;
};

export default function TimelineBar({
  duration = 30,
  tickCount = 25,
}: TimelineBarProps) {
  const countArray = [...Array(tickCount)];

  return (
    <div className="gencl:relative gencl:h-8 gencl:w-full gencl:flex gencl:items-center gencl:px-3">
      {/* Start Duration */}
      <span className="gencl:text-left gencl:text-body-2-medium gencl:text-secondary-600">
        {formatTime(0)}
      </span>

      {/* Tick Marks */}
      <div className="gencl:flex-grow gencl:relative gencl:h-full gencl:flex gencl:items-center">
        {countArray.map((_, i) => (
          <div
            key={i}
            className="gencl:shrink-0 gencl:flex gencl:justify-center"
            style={{ flex: "1 0 auto" }}
          >
            <div
              className={`gencl:w-[1px] gencl:bg-secondary-600 gencl:rounded gencl:block ${
                // Apply a slightly taller tick mark every 3rd tick, excluding the first and last
                i % 3 === 0 && i !== 0 && countArray.length - 1 !== i
                  ? "gencl:h-1.5"
                  : "gencl:h-1"
              }`}
            />
          </div>
        ))}
      </div>

      {/* End Duration */}
      <span className="gencl:text-right gencl:text-body-2-medium gencl:text-secondary-600">
        {formatTime(duration)}
      </span>
    </div>
  );
}
