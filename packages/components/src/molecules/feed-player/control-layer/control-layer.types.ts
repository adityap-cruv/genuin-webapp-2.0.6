import { ComponentProps } from "react";
import { ExpandViewDetails } from "./expand-view";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { VariantProps } from "class-variance-authority";
import { controlLayerVariant } from "./control-layer";

export type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isInModal?: boolean;
  isActive: boolean;
  showCloseButton?: boolean;
  isSectioned?: boolean;
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
} & VariantProps<typeof controlLayerVariant>;
