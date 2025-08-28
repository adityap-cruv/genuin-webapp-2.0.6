import type { ComponentProps } from "react";

export type ReadMoreTextType =
  | string
  | null
  | Array<Record<string, unknown> | string | null>;

export type ReadMoreProps = {
  /**
   * The text content to display. Can be a string or an array of objects for rich text.
   */
  text?: ReadMoreTextType;
  /**
   * Maximum number of characters to show before truncation.
   * Only used when truncateBy is 'characters'
   */
  maxChars?: number;
  /**
   * Maximum number of lines to show before truncation
   * @default 1
   */
  maxLines?: number;
  /**
   * Maximum width of the component container
   * @default '100%'
   */
  maxWidth?: string | number;
  /**
   * Whether to show the "View more/less" button
   * @default true
   */
  showExpandText?: boolean;
  /**
   * Whether to animate the expansion/collapse
   * @default false
   */
  shouldAnimate?: boolean;
  /**
   * The position of the text relative to its container
   * @default 'outside'
   */
  position?: "overlay" | "outside";
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Custom class name for the text content
   */
  textClassName?: string;
  /**
   * Custom class name for the view more/less button
   */
  buttonClassName?: string;
  /**
   * Custom text for the "View more" button
   * @default "(View more)"
   */
  viewMoreText?: string;
  /**
   * Custom text for the "View less" button
   * @default "(View less)"
   */
  viewLessText?: string;
  /**
   * Height of the expanded view
   * @default "500px"
   */
  expandedHeight?: string;
  /**
   * Default Configuration to Open Expanded or not
   * @default false
   */
  defaultExpand?: boolean;
  /**
   * Callback of Parent if there is already Expanded
   */
  onExpandChange?: (isExpanded: boolean) => void;
  /**
   * Boolean value for the explicitly manage the state of parent for expansion
   */
  open?: boolean;
  /**
   * URL to make the text content clickable as a link
   */
  href?: string;
  /**
   * Custom class name for the link wrapper
   */
  linkClassName?: string;
} & Omit<ComponentProps<"p">, "children">;
