import { PublicIcon, LockIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { ReactNode } from "react";
import { ProfileLink } from "@molecules/profile-link";
import { Stats } from "@molecules/stats/stats";

/**
 * Props for the GenericDetailsMetadata component
 */
type GenericDetailsMetadataProps = ComponentProps<"div"> & {
  handle?: {
    userName: string;
    url: string;
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
  stats?: Record<string, number>;
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
 * @param props.brandDetails - Optional brand/user information to display
 * @param props.stats - Optional statistics to display as key-value pairs
 * @param props.privacyInfo - Optional privacy information to display
 * @param props.className - Additional CSS classes to apply
 *
 * @returns A div containing the formatted metadata information
 *
 * @example
 * ```tsx
 * // Display all metadata types
 * <GenericDetailsMetadata
 *   privacyInfo={{ isPrivate: false }}
 *   brandDetails={{
 *     userName: "johndoe",
 *     isVerified: true,
 *     url: "https://example.com/johndoe"
 *   }}
 *   stats={{
 *     views: 1234,
 *     likes: 56,
 *     shares: 12
 *   }}
 * />
 *
 * // Display only privacy and stats
 * <GenericDetailsMetadata
 *   privacyInfo={{ isPrivate: true }}
 *   stats={{ followers: 500 }}
 * />
 * ```
 */
export function GenericDetailsMetadata({
  handle,
  stats,
  privacyInfo,
  className,
  others,
  ...restProps
}: GenericDetailsMetadataProps) {
  return (
    <div
      className={cn(
        "gencl:text-body-1-medium! gencl:text-secondary-600 gencl:flex gencl:gap-2",
        className
      )}
      {...restProps}
    >
      {/** todo: replace it with <PrivacyInfo/> component. */}
      {privacyInfo && (
        <>
          <div className="gencl:flex gencl:[&_svg]:size-4  gencl:items-center gencl:gap-1">
            {privacyInfo.isPrivate ? (
              <LockIcon className="gencl:stroke-secondary-600" />
            ) : (
              <PublicIcon className="gencl:stroke-secondary-600" />
            )}
            {(privacyInfo.showPrivacyText === undefined ||
              privacyInfo.showPrivacyText !== false) &&
              (privacyInfo.isPrivate ? " Private" : " Public")}
          </div>
        </>
      )}
      {handle && (
        <>
          <p>•</p>
          <span className="gencl:flex gencl:items-center">
            <ProfileLink url={handle.url} userLogoType={handle.brandUserLogo}>
              @{handle.userName}
            </ProfileLink>
          </span>
        </>
      )}
      {stats && (
        <>
          <p>•</p>
          <Stats
            stats={stats}
            className="gencl:flex gencl:gap-1"
            valueFirst={true}
            valueClassName="gencl:text-black! gencl:mr-1"
            labelClassName="gencl:mr-1"
            separator="•"
          />
        </>
      )}
      {others && (
        <>
          <p>•</p>
          {others}
        </>
      )}
    </div>
  );
}
