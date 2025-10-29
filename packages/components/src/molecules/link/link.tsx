"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import type { NextJSLinkProps } from "@genuin/components/context/link/type";
import { useLinkContext } from "@genuin/components/context/link";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useBaseContext } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

type BaseLinkProps = ComponentProps<"a">;

type ExtendedLinkProps = BaseLinkProps & Partial<NextJSLinkProps>;

type LinkProps = ExtendedLinkProps & {
  /**
   * Pass false if want to disable the routing.
   */
  enabled?: boolean;
  /**
   * The URL to navigate to when the link is clicked.
   */
  href: string;
  /**
   * Pass true to bypass all checks and render a plain <a> element directly.
   * When enabled, all context checks, redirection logic, and custom routing are skipped.
   */
  bypassChecks?: boolean;
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
) {
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

function checkIfExternal(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("//")
  );
}

export function Link({
  className,
  href,
  children,
  enabled = true,
  bypassChecks = false,
  // Next.js specific props
  as,
  replace,
  scroll,
  shallow,
  passHref,
  prefetch,
  locale,
  legacyBehavior,
  target,
  // Standard props
  ...restProps
}: LinkProps) {
  // If bypassChecks is true, render a plain <a> element directly
  if (bypassChecks) {
    return (
      <a href={href} className={className} target={target} {...restProps}>
        {children}
      </a>
    );
  }

  const { LinkComponent, isNextJS, isCustomRouting, createExternalLink } =
    useLinkContext();
  const wantsToOpenInNewTab = target === "_blank";

  // Extract engagement configurations for redirection tools and link behavior
  const {
    engagement: { redirectionTools, openAllLinksInNewTab },
  } = useEmbedConfigs();

  // Retrieve brand details from the base context
  const { brandDetails } = useBaseContext();

  const embedContext = useSafeEmbedContext();

  // Determine if the href is an external link
  let isHrefExternal = typeof href === "string" && checkIfExternal(href);

  // If the link is intended to open in a new tab and is not already external, convert it to an external URL
  // This is necessary for internal links that should open in a new tab.
  if (wantsToOpenInNewTab && href && !isHrefExternal) {
    href = createExternalLink(href);
    isHrefExternal = true;
  }

  // Determine if routing/redirection should be enabled for the given href
  const isEnabled = isHrefExternal
    ? true
    : checkRedirectionEnabled(href, redirectionTools);

  // If the link is not external, modify href based on conditions
  if (!isHrefExternal) {
    if (
      isEnabled &&
      openAllLinksInNewTab &&
      typeof href === "string" &&
      brandDetails.white_label_url
    ) {
      // Create an external URL using the white-label host and update href
      href = createExternalLink(href);
      isHrefExternal = true; // Uncomment if needed to mark as external
    }
  }

  // Final determination of whether the link is external
  const isExternal = isHrefExternal;

  if (!href || !enabled || !isEnabled) {
    return <>{children}</>;
  }

  // If it's an embed, return a placeholder or specific content
  if (isCustomRouting && !isExternal) {
    const { onClick, ...restRestProps } = restProps;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!href) return;

      e.preventDefault(); // Ensure this runs once
      try {
        // As we only have to pass the pathname and to navigate internally.
        embedContext?.embedRouter.navigate(href);
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
