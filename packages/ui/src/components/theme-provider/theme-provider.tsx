import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Known publisher / brand themes. Open-ended via the `string` fallback so
 * hosts can register custom themes (by shipping a matching `.theme-<name>`
 * block in their own stylesheet) without modifying `@genuin/ui`.
 *
 * Built-in palettes live in `packages/tailwind-config/themes.css`.
 */
export type ThemeName =
  | "artitech"
  | "genuin"
  | "harley-davidson"
  | "iheart"
  | "mcclatchy"
  | "planet-fitness"
  | "us-weekly"
  | (string & {});

/** Light / dark mode. The `dark` class is added when `mode === "dark"`. */
export type ThemeMode = "light" | "dark";

/**
 * Props for the {@link ThemeProvider} primitive.
 *
 * Pure wrapper — no React Context, no hooks. Descendants pick up the
 * active palette via CSS variables that the wrapper's class overrode.
 */
export interface ThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Publisher / brand theme. Defaults to `"genuin"` (the `:root` palette). */
  theme?: ThemeName;
  /** Light / dark mode. Defaults to `"light"`. */
  mode?: ThemeMode;
  /** Render as a different element via Radix Slot. */
  asChild?: boolean;
  /** Subtree the theme should apply to. */
  children: React.ReactNode;
}

/**
 * Wraps a subtree with a publisher / mode-specific palette by applying
 * `.theme-<name>` (and optionally `.dark`) plus matching `data-*` hooks.
 *
 * Server-component-safe — no `'use client'`, no React Context. The CSS
 * variable layer does all the work: descendants render against whichever
 * palette the wrapper's class points to.
 *
 * @example
 * ```tsx
 * <ThemeProvider theme="iheart">
 *   <PageRenderer page={page} />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider = React.forwardRef<HTMLDivElement, ThemeProviderProps>(function ThemeProvider(
  { theme = "genuin", mode = "light", asChild = false, className, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="theme-provider"
      data-theme={theme}
      data-mode={mode}
      className={cn(`theme-${theme}`, mode === "dark" && "dark", className)}
      {...props}>
      {children}
    </Comp>
  );
});
