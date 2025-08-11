"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import type { NextJSLinkProps } from "@genuin/components/context/link/type";
import { useLinkContext } from "@genuin/components/context/link";
import { navigate } from "@genuin/components/lib/utils/embed-router";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type BaseLinkProps = ComponentProps<"a">;

type ExtendedLinkProps = BaseLinkProps & Partial<NextJSLinkProps>;

type LinkProps = ExtendedLinkProps & {
  enabled?: boolean;
};

/**
 * Checks if redirection is enabled for a given path based on redirection tools configuration
 * @param href The URL to check
 * @param redirectionTools Configuration for different redirection tools
 * @returns Whether redirection is enabled for the given path
 */
function checkRedirectionEnabled(
  href: string | undefined,
  redirectionTools:
    | { user?: boolean; community?: boolean; group?: boolean }
    | undefined
): boolean {
  let isEnabled = true;

  if (
    href?.startsWith("/profile") ||
    href?.startsWith("profile") ||
    href?.startsWith("/brand") ||
    href?.startsWith("brand")
  ) {
    isEnabled = redirectionTools?.user ?? true;
  }

  if (href?.startsWith("/community") || href?.startsWith("community")) {
    isEnabled = redirectionTools?.community ?? true;
  }

  if (href?.startsWith("/group") || href?.startsWith("group")) {
    isEnabled = redirectionTools?.group ?? true;
  }

  return isEnabled;
}

export function Link({
  className,
  href,
  children,
  enabled = true,
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
}: LinkProps) {
  const { LinkComponent, isNextJS, isCustomRouting } = useLinkContext();
  const {
    engagement: { redirectionTools },
  } = useEmbedConfigs();
  const isEnabled = checkRedirectionEnabled(href, redirectionTools);

  if (!href || !enabled || !isEnabled) {
    return <>{children}</>;
  }

  // If it's an embed, return a placeholder or specific content
  if (isCustomRouting) {
    const { onClick, ...restRestProps } = restProps;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!href) return;

      e.preventDefault(); // Ensure this runs once
      try {
        // As we only have to pass the pathname and to navigate internally.
        navigate(href);
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    };

    return (
      <span
        className={cn("gencl:cursor-pointer", className)}
        onClick={handleClick}
        {...restRestProps}
      >
        {children}
      </span>
    );
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
