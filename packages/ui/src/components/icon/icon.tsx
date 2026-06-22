import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  HelpCircle,
  Heart,
  Info,
  Link as LinkIcon,
  Menu,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Share,
  Star,
  X,
} from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Curated icon name enum. Closed by design — the AI layout generator
 * needs a finite vocabulary, not lucide's 1000+ icon set. Add to this
 * set as the agent's needs grow; never bypass it.
 */
export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "chevron-right"
  | "chevron-left"
  | "chevron-up"
  | "chevron-down"
  | "check"
  | "x"
  | "plus"
  | "minus"
  | "search"
  | "menu"
  | "more-horizontal"
  | "more-vertical"
  | "share"
  | "bookmark"
  | "heart"
  | "star"
  | "external-link"
  | "link"
  | "copy"
  | "play"
  | "pause"
  | "info"
  | "alert-circle"
  | "help-circle";

/** Icon size token — maps to pixel values via {@link SIZE_PX}. */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Colour tone token. `currentColor` (default) inherits from the parent
 * text colour — the most common case when an icon sits inside a button
 * or link.
 */
export type IconTone = "default" | "subtle" | "inverted" | "currentColor";

/**
 * Lucide component shape we depend on. Lucide-react components are
 * `forwardRef`-wrapped under the hood and accept every SVG attribute,
 * but the published types differ slightly between minor versions — we
 * narrow to the props we actually pass so the lookup map stays stable.
 */
type LucideComponent = React.ForwardRefExoticComponent<
  React.SVGAttributes<SVGSVGElement> & { size?: number | string } & React.RefAttributes<SVGSVGElement>
>;

/**
 * Closed lookup from curated name → lucide component. The map is
 * `Record<IconName, …>` so adding to {@link IconName} forces an entry
 * here at compile time.
 */
const ICON_MAP = {
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  check: Check,
  x: X,
  plus: Plus,
  minus: Minus,
  search: Search,
  menu: Menu,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  share: Share,
  bookmark: Bookmark,
  heart: Heart,
  star: Star,
  "external-link": ExternalLink,
  link: LinkIcon,
  copy: Copy,
  play: Play,
  pause: Pause,
  info: Info,
  "alert-circle": AlertCircle,
  "help-circle": HelpCircle,
} satisfies Record<IconName, LucideComponent>;

/** Icon size token → pixel value. Passed to lucide as the `size` prop. */
const SIZE_PX: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

/**
 * Tone token → Tailwind colour class. `currentColor` resolves to no
 * class — the SVG inherits its parent's text colour, which is the
 * default lucide behaviour.
 */
const TONE_CLASS: Record<IconTone, string> = {
  currentColor: "",
  default: "gencl:text-secondary-900",
  subtle: "gencl:text-secondary-600",
  inverted: "gencl:text-white",
};

/**
 * Props for the {@link Icon} static-page primitive.
 *
 * `Icon` is a thin wrapper around lucide-react with a **closed curated
 * `name` enum**. The closed enum is load-bearing for the AI layout
 * generator — it caps the icon vocabulary at a manageable size.
 */
export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "aria-label"> {
  /** Curated icon name (closed enum — see {@link IconName}). */
  name: IconName;
  /** Pixel size token. Defaults to `"md"` (16 px). */
  size?: IconSize;
  /** Colour tone. Defaults to `"currentColor"` (inherits from parent). */
  tone?: IconTone;
  /**
   * Accessibility label. Required for standalone icons — pass an empty
   * string for decorative icons whose meaning is already conveyed by
   * the surrounding user-visible text.
   */
  "aria-label": string;
}

/**
 * Curated icon primitive. Renders a lucide-react SVG matched by name
 * from a closed enum, sized via DS token and coloured via tone token.
 *
 * For an icon that's purely decorative (the surrounding text already
 * conveys the meaning), pass `aria-label=""` to mark it as decorative.
 * For a standalone icon, pass a meaningful label.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "md", tone = "currentColor", className, "aria-label": ariaLabel, ...props },
  ref
) {
  const LucideIcon = ICON_MAP[name];
  const pixelSize = SIZE_PX[size];
  const isDecorative = ariaLabel === "";

  return (
    <LucideIcon
      // Lucide forwards the ref through to the underlying SVG element,
      // but its public TS types don't expose it — cast through here.
      ref={ref as unknown as React.Ref<SVGSVGElement>}
      size={pixelSize}
      data-slot="icon"
      data-icon-name={name}
      className={cn(TONE_CLASS[tone], className)}
      // ARIA: decorative icons get aria-hidden; standalone icons keep
      // their accessible name.
      aria-label={isDecorative ? undefined : ariaLabel}
      aria-hidden={isDecorative ? true : undefined}
      role={isDecorative ? undefined : "img"}
      {...props}
    />
  );
});
