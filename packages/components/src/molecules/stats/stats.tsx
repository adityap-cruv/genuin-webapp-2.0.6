import { CommentIcon, PlayIcon, SparkIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { abbreviateNumber } from "@genuin/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

type StatsKeyType =
  | "Members"
  | "Posts"
  | "Comments"
  | "Reactions"
  | "Shares"
  | "Videos"
  | "Communities"
  | "Views"
  | "Groups";

const statsVariant = cva("", {
  variants: {
    theme: {
      secondary: "gencl:text-secondary-600",
    },
    variant: {
      /**
       * This variant will show the stats in a column layout with icons and labels.
       */
      descriptive: "gencl:flex gencl:flex-col gencl:gap-2",
    },
  },
  defaultVariants: {
    theme: undefined,
    variant: undefined,
  },
});

type StatsPropsType = {
  /**
   * An object where each key is a statistic name and the value can be:
   * - A number representing the statistic value.
   * - An object with `value`, `label`, and an optional `icon`.
   */
  stats: Partial<
    Record<StatsKeyType, { value: number; icon?: ReactNode } | number>
  >;
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
   * Optional separator to be used between the stats items. Can be an Icon component or any ReactNode.
   */
  separator?: ReactNode | string;
} & ComponentProps<"div"> &
  VariantProps<typeof statsVariant>;

const Icons = (
  theme: VariantProps<typeof statsVariant>["theme"]
): Partial<Record<StatsKeyType, ReactNode>> => {
  return {
    Views: (
      <PlayIcon
        theme={theme === "secondary" ? "secondary" : "light"}
        size="md"
      />
    ),
    Comments: (
      <CommentIcon
        theme={theme === "secondary" ? "secondary" : "light"}
        size="md"
      />
    ),
    Reactions: (
      <SparkIcon
        theme={theme === "secondary" ? "secondary" : "light"}
        size="md"
      />
    ),
  };
};

/**
 * Renders a list of statistics.
 * Each statistic can be a simple key-value pair or an object with a value, label, and an optional icon.
 * If an icon is provided, it will be rendered instead of the label.
 */
export function Stats({
  variant,
  stats,
  theme,
  valueClassName,
  labelClassName,
  pairClassName,
  valueFirst = false, // Default to false if not provided
  separator = <></>, // Default to non-breaking space if not provided
  className,
  ...restProps
}: StatsPropsType) {
  const statEntries = Object.entries(stats);

  if (variant === "descriptive") {
    return (
      <div
        className={cn(
          "gencl:space-y-2",
          statsVariant({ variant, theme }),
          className
        )}
        {...restProps}
      >
        {statEntries.map(([key, value]) => {
          const isObjectWithValue = typeof value === "object" && value !== null;
          const val = isObjectWithValue ? value.value : value;
          const label = key;
          const icon = Icons("secondary")[key as StatsKeyType];

          return (
            <div
              key={key}
              className="gencl:flex gencl:items-center gencl:gap-2"
            >
              {icon && icon}
              <p className="gencl:text-body-1-medium">
                {abbreviateNumber(val)}&nbsp;
                {label}
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className={cn(className, statsVariant({ variant }))} {...restProps}>
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
            className={cn(
              "gencl:flex gencl:gap-2 gencl:items-center",
              pairClassName
            )}
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
