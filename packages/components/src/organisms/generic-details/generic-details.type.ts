import { LinksType } from "@genuin/components/molecules/social-links";
import { ReadMoreTextType } from "@genuin/ui/components/read-more";
import { ComponentProps, ReactNode } from "react";
import { GenericDetailsVariants } from "./generic-details.cva";
import { Stats } from "@genuin/components/molecules/stats";

/**
 * Configuration for the profile image displayed in the generic details component.
 */
export type ProfileImageDetails = {
  /** Alternative text for the image, used for accessibility */
  alt: string;
  /** URL of the image to be displayed */
  imageUrl: string;
  /** Whether the image should be rendered as an avatar */
  isAvatar: boolean;
};

/**
 * Metadata to be displayed in the generic details component.
 * This can include any additional information relevant to the details being shown.
 */
export type GenericDetailsDataType = {
  /**
   * Optional handle configuration for displaying user or brand information.
   */
  handle?: {
    userName: string;
    brandUserLogo?: number | null;
  };
  /**
   * Statistics to be displayed in the generic details component. This will be used for mobile view.
   */
  stats?: ComponentProps<typeof Stats>["stats"];
  /**
   * Optional profile image configuration. When provided, displays an avatar
   * with the specified image URL, alt text, and avatar styling.
   */
  profileImageDetails?: ProfileImageDetails;
  /**
   * Optional title text to display. When provided, renders as a headline
   * using the headline-2-semi-bold styling.
   */
  title: string;
  /**
   * Pass it if you want to render user.
   */
  userLogoType?: number | null;
  /**
   * Pass the url if you want to make the title clickable.
   */
  url?: string;
  /**
   * Optional metadata component for displaying additional information such as brand details and stats.
   */
  metadata: ReactNode;
  /**
   * Description text to display. This can be a string or a more complex structure
   */
  description?: ReadMoreTextType;
  /**
   * Links to social media or other external resources.
   */
  links?: LinksType;
  /**
   * Optional call-to-action buttons or components to display alongside the details.
   */
  ctas?: ReactNode;
  /**
   * Optional based on pinned status show the pin icon
   */
  showPinned?: boolean;
  /**
   * Information about the owner of the content.
   */
  ownerInfo?: {
    userName: string;
  };
};

export type GenericDetailsProps = GenericDetailsDataType &
  ComponentProps<"div"> &
  GenericDetailsVariants;
