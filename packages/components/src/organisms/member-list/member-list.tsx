import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { MemberItem, type MemberDataType } from "src/molecules/member-item";

type MemberListProps = {
  title?: string;
  members: MemberDataType[];
  fetchNextPage?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
} & ComponentProps<"div">;

export function MemberList({
  title,
  members,
  fetchNextPage,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  className,
  ...restProps
}: MemberListProps) {
  if (members.length === 0 && isLoading)
    return (
      <div
        className={cn("gencl:flex gencl:w-full gencl:flex-col", className)}
        {...restProps}
      >
        {title && (
          <p className="gencl:pl-4 gencl:pb-4 gencl:text-body-1-medium">
            {title}
          </p>
        )}
        <InfiniteScroll
          hasNextPage={hasNextPage}
          getNextPage={fetchNextPage}
          isLoadingNextPage={isFetchingNextPage}
          loader={<div></div>}
        >
          {members.map((member) => (
            <MemberItem
              key={member.memberId}
              memberData={member}
              className="gencl:py-2 gencl:rounded-lg gencl:hover:bg-secondary-150 gencl:pl-2 gencl:pr-4"
            />
          ))}
        </InfiniteScroll>
      </div>
    );
}
