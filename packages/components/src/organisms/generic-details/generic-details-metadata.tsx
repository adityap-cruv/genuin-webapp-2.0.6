import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { ReactNode, Fragment } from "react";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { Stats } from "@genuin/components/molecules/stats/stats";
import { CommunityPrivacyInfo } from "@genuin/components/molecules/community-privacy-info";

/**
 * Props for the GenericDetailsMetadata component
 */
type GenericDetailsMetadataProps = ComponentProps<"div"> & {
  handle?: {
    userName: string;
    url?: string | null;
    brandUserLogo?: number | null;
  };
  /**
   * Statistics to display as key-value pairs
   * @example
   * ```tsx
   * stats={{
   *   views: 1234,
   *   likes: 56,
   *   shares: 12
   * }}
   * ```
   */
  stats?: ComponentProps<typeof Stats>["stats"];
  /**
   * Privacy information to display
   * @example
   * ```tsx
   * privacyInfo={{
   *   isPrivate: false
   * }}
   * ```
   */
  privacyInfo?: {
    /** Whether the content is private (shows lock icon) or public (shows public icon) */
    isPrivate: boolean;
    showPrivacyText?: boolean; // Optional, defaults to true
  };
  /**
   * Additional comps to render.
   */
  others?: ReactNode;
  /**
   * Configuration for showing bullet separators between elements
   * @example
   * ```tsx
   * // Show bullets only after privacy and handle sections
   * separatorConfig={{
   *   afterPrivacy: true,
   *   afterHandle: true,
   *   afterStats: false
   * }}
   * ```
   * If not provided, bullets will be shown between all sections by default
   */
  separatorConfig?: {
    /** Show separator after privacy information */
    afterPrivacy?: boolean;
    /** Show separator after handle information */
    afterHandle?: boolean;
    /** Show separator after statistics */
    afterStats?: boolean;
  };
};

/**
 * GenericDetailsMetadata - A flexible metadata component for displaying privacy info, brand details, and statistics
 *
 * This component renders metadata information in a horizontal layout with bullet separators.
 * It supports three main types of information:
 * - Privacy information (Private/Public with icons)
 * - Brand/user details (username with verification status and link)
 * - Statistics (key-value pairs with customizable formatting)
 *
 * @param props - Component props extending div HTML attributes
 * @param props.handle - Optional user/brand information to display
 * @param props.stats - Optional statistics to display as key-value pairs
 * @param props.privacyInfo - Optional privacy information to display
 * @param props.others - Optional additional elements to display
 * @param props.separatorConfig - Optional configuration for bullet separators between elements
 * @param props.className - Additional CSS classes to apply
 *
 * @returns A div containing the formatted metadata information
 *
 * @example
 * ```tsx
 * // Display all metadata types with default bullet separators
 * <GenericDetailsMetadata
 *   privacyInfo={{ isPrivate: false }}
 *   handle={{
 *     userName: "johndoe",
 *     url: "https://example.com/johndoe"
 *   }}
 *   stats={{
 *     views: 1234,
 *     likes: 56,
 *     shares: 12
 *   }}
 * />
 *
 * // Display with custom bullet separator configuration
 * <GenericDetailsMetadata
 *   privacyInfo={{ isPrivate: true }}
 *   handle={{ userName: "janedoe" }}
 *   stats={{ followers: 500 }}
 *   separatorConfig={{
 *     afterPrivacy: true,
 *     afterHandle: false,
 *     afterStats: true
 *   }}
 * />
 * ```
 */
export function GenericDetailsMetadata({
  handle,
  stats,
  privacyInfo,
  className,
  others,
  separatorConfig,
  ...restProps
}: GenericDetailsMetadataProps) {
  // Create an array of elements to render with conditional rendering
  const metadataElements = [
    privacyInfo && {
      key: "privacy",
      element: (
        <CommunityPrivacyInfo
          isPrivate={privacyInfo.isPrivate}
          showPrivacyText={privacyInfo.showPrivacyText}
        />
      ),
      showSeparatorAfter: separatorConfig?.afterPrivacy !== false,
    },
    handle && {
      key: "handle",
      element: (
        <span className="gencl:flex gencl:items-center">
          <ProfileLink
            url={handle.url ?? undefined}
            userLogoType={handle.brandUserLogo}
          >
            @{handle.userName}
          </ProfileLink>
        </span>
      ),
      showSeparatorAfter: separatorConfig?.afterHandle !== false,
    },
    stats && {
      key: "stats",
      element: (
        <Stats
          stats={stats}
          className="gencl:flex gencl:gap-2"
          valueFirst={true}
          valueClassName="gencl:text-black!"
          separator="•"
        />
      ),
      showSeparatorAfter: separatorConfig?.afterStats !== false,
    },
    others && {
      key: "others",
      element: (
        <span className="gencl:flex gencl:items-center gencl:gap-2">
          {others}
        </span>
      ),
      showSeparatorAfter: false, // No separator after the last element
    },
  ].filter(Boolean) as Array<{
    key: string;
    element: ReactNode;
    showSeparatorAfter: boolean;
  }>;

  return (
    <div
      className={cn(
        "gencl:text-body-1-medium! gencl:text-secondary-600 gencl:flex gencl:flex-wrap gencl:sm:flex-nowrap gencl:gap-2",
        className
      )}
      {...restProps}
    >
      {metadataElements.map((item, index) => (
        <Fragment key={`metadata-item-${item.key}-${index}`}>
          {item.element}
          {index < metadataElements.length - 1 && item.showSeparatorAfter && (
            <span className="gencl:text-secondary-600">•</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
