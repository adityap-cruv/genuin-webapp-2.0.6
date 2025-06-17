"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import type { NextJSLinkProps } from "@genuin/components/context/link/type";
import { useLinkContext } from "@genuin/components/context/link";

type BaseLinkProps = ComponentProps<"a">;

type ExtendedLinkProps = BaseLinkProps & Partial<NextJSLinkProps>;

export function Link({
  className,
  href,
  children,
  // Next.js specific props
  as,
  replace,
  scroll,
  shallow,
  passHref,
  prefetch,
  locale,
  legacyBehavior,
  // Standard props
  ...restProps
}: ExtendedLinkProps) {
  const { LinkComponent, isNextJS } = useLinkContext();

  if (!href) {
    return <>{children}</>;
  }

  // Check if it's an external link
  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("//"));

  // Use anchor tag for external links
  if (isExternal || !LinkComponent) {
    const anchorProps = {
      href: typeof href === "string" ? href : href,
      className: cn("gencl:cursor-pointer", className),
      target: isExternal ? "_blank" : undefined,
      rel: isExternal ? "noopener noreferrer" : undefined,
      ...restProps,
    };

    return <a {...anchorProps}>{children}</a>;
  }

  // Prepare props for the LinkComponent
  const linkProps: any = {
    href,
    className: cn("gencl:cursor-pointer", className),
    ...restProps,
  };

  // Add Next.js specific props only if it's Next.js
  if (isNextJS) {
    if (as !== undefined) linkProps.as = as;
    if (replace !== undefined) linkProps.replace = replace;
    if (scroll !== undefined) linkProps.scroll = scroll;
    if (shallow !== undefined) linkProps.shallow = shallow;
    if (passHref !== undefined) linkProps.passHref = passHref;
    if (prefetch !== undefined) linkProps.prefetch = prefetch;
    if (locale !== undefined) linkProps.locale = locale;
    if (legacyBehavior !== undefined) linkProps.legacyBehavior = legacyBehavior;
  }

  return <LinkComponent {...linkProps}>{children}</LinkComponent>;
}
