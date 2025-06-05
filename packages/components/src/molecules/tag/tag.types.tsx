import type { ComponentProps } from "react";

/**
 * Props for the Tag component.
 */
export type TagProps = {
  /**
   * Profile image properties.
   * If showing for community than pass isAvatar as false.
   */
  profileImage: { isAvatar?: boolean; url: string };
  /**
   * Alt text for the profile image.
   */
  alt: string;
  /**
   * User name, should start with '@' and contain no spaces.
   */
  userName: string;
  /**
   * URL for the tag link.
   */
  url: string;
  /**
   * Whether the user is verified.
   * @default false
   */
  userLogoType?: number | null;
} & ComponentProps<"div">;
