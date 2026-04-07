import { ComponentProps } from "react";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { VariantProps } from "class-variance-authority";
import { controlLayerVariant } from "./control-layer";
import { BrandType } from "@genuin/components/lib/utils/brand-layout";
import type { ExpandViewCallbacks } from "./expand-view";

export type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: any;
  isInModal?: boolean;
  isActive: boolean;
  index?: number;
  showCloseButton?: boolean;
  isSectioned?: boolean;
  clipVideo?: boolean;
  editCover?: boolean;
  enableExpand?: boolean;
  expandViewDetails?: boolean;
  layoutType?: "responsiveness" | BrandType;
  editClipVideo?: (url: string) => void;
  editCoverImage?: (url: string) => void;
} & ExpandViewCallbacks &
  VariantProps<typeof controlLayerVariant>;
