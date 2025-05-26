import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@genuin/ui/collapsible";
import { ReadMore } from "@genuin/ui/read-more";
import { ChevronUpIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps, useState } from "react";

import type { PostDetailsType } from "src/react-query/api/feed/schema";

import { CommunityDetails } from "./community-details";
import { OwnerInfo } from "./owner-info";

export type DetailsPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
};

/**
 * This component is used to display the details of a post.
 * It mainly contains the details of owner/community/loop.
 *
 * Create more flavour around this component for mobile view and full screen view.
 * @param param0
 * @returns
 */
export function PostDetails({
  postDetails: { community, owner, video, group },
  className,
  ...restProps
}: DetailsPropsType) {
  const [collapsibleOpen, setCollapsibleOpen] = useState(true);

  return (
    <div
      className={cn(
        "gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl",
        className
      )}
      {...restProps}
    >
      <Collapsible
        defaultOpen
        open={collapsibleOpen}
        onOpenChange={setCollapsibleOpen}
      >
        <div
          className={cn(
            "gencl:border-secondary-150  gencl:space-y-3",
            collapsibleOpen && "gencl:border-b gencl:pb-4"
          )}
        >
          <div className="gencl:flex gencl:items-center gencl:justify-between gencl:gap-x-2">
            <OwnerInfo owner={owner} />
            <CollapsibleTrigger className="gencl:cursor-pointer">
              <ChevronUpIcon
                className={cn(
                  "gencl:transition-all",
                  collapsibleOpen ? "gencl:-rotate-180" : "gencl:rotate-0"
                )}
              />
            </CollapsibleTrigger>
          </div>
          <ReadMore
            text={video.description ?? ""}
            className="gencl:text-body-1-medium"
          />
        </div>
        <CollapsibleContent>
          <CommunityDetails communityDetails={community} groupDetails={group} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
