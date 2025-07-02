import { cn } from "@genuin/ui/utils";
import { abbreviateNumber } from "@genuin/ui/utils";
import type { ComponentProps, ReactNode } from "react";

type StatsPropsType = {
  /**
   * An object where each key is a statistic name and the value can be:
   * - A number representing the statistic value.
   * - An object with `value`, `label`, and an optional `icon`.
   */
  stats: Record<string, { value: number; icon?: ReactNode } | number>;
  /**
   * If value should be displayed before the label.
   */
  valueFirst?: boolean;
  /**
   * Optional class name for the value part of the statistic.
   */
  valueClassName?: string;
  /**
   *
   */
  pairClassName?: string;
  /**
   * Optional class name for the label part of the statistic.
   */
  labelClassName?: string;
  /**
   * Optional separator to be used between the statsitem.
   */
  separator?: string;
} & ComponentProps<"div">;

/**
 * Renders a list of statistics.
 * Each statistic can be a simple key-value pair or an object with a value, label, and an optional icon.
 * If an icon is provided, it will be rendered instead of the label.
 */
export function Stats({
  stats,
  valueClassName,
  labelClassName,
  pairClassName,
  valueFirst = false, // Default to false if not provided
  separator = " ", // Default to non-breaking space if not provided
  className,
  ...restProps
}: StatsPropsType) {
  const statEntries = Object.entries(stats);
  return (
    <div className={cn(className)} {...restProps}>
      {statEntries.map(([key, value], index) => {
        const isObjectWithValue = typeof value === "object" && value !== null;
        const val = isObjectWithValue ? value.value : value;
        const label = key;
        const icon = isObjectWithValue ? value.icon : undefined;

        const valueElement = (
          <span
            className={cn(
              "gencl:text-black gencl:text-body-1-semi-bold",
              valueClassName
            )}
          >
            {abbreviateNumber(val)}
          </span>
        );

        const labelElement = icon ? (
          <>{icon}</>
        ) : (
          <span className={cn("gencl:text-body-1-medium", labelClassName)}>
            {label}
          </span>
        );

        return (
          <div
            key={key}
            className={cn("gencl:flex gencl:items-center", pairClassName)}
          >
            {valueFirst ? (
              <>
                {valueElement}
                {labelElement}
              </>
            ) : (
              <>
                {labelElement}
                {valueElement}
              </>
            )}
            {index < statEntries.length - 1 && separator}
          </div>
        );
      })}
    </div>
  );
}
