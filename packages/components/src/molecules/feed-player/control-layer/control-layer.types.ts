import { ComponentProps } from "react";
import { ExpandViewDetails } from "./expand-view";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { VariantProps } from "class-variance-authority";
import { controlLayerVariant } from "./control-layer";
import { BrandType } from "@genuin/components/lib/utils/brand-layout";

export type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isInModal?: boolean;
  isActive: boolean;
  index: number;
  showCloseButton?: boolean;
  isSectioned?: boolean;
  clipVideo?: boolean;
  editCover?: boolean;
  enableExpand?: boolean;
  expandViewDetails?: boolean;
  layoutType?: "responsiveness" | BrandType;
  editClipVideo?: (url: string) => void;
  editCoverImage?: (url: string) => void;
  onReactionStateChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onReactionStateChange"];
  onGroupJoinStatusChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onCommunityJoinStatusChange"];
  onCommentCountChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onCommentCountChange"];
} & VariantProps<typeof controlLayerVariant>;
