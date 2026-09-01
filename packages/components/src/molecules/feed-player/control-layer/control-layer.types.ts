import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import type { BrandType } from "@genuin/components/lib/utils/brand-layout";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import type { controlLayerVariant } from "./control-layer";
import type { ExpandViewCallbacks } from "./expand-view";

export type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isInModal?: boolean;
  isActive: boolean;
  index?: number;
  showCloseButton?: boolean;
  isSectioned?: boolean;
  clipVideo?: boolean;
  editCover?: boolean;
  enableExpand?: boolean;
  /** Overrides the normal expand action for presentations such as the inline-article player. */
  onExpandClick?: () => void;
  expandViewDetails?: boolean;
  layoutType?: "responsiveness" | BrandType;
  containerWidth?: number;
  /** Determines which side the mute button is positioned on during ad playback. Defaults to "in-feed". */
  adType?: "in-feed" | "in-stream";
  editClipVideo?: (url: string) => void;
  editCoverImage?: (url: string) => void;
} & ExpandViewCallbacks &
  VariantProps<typeof controlLayerVariant>;
