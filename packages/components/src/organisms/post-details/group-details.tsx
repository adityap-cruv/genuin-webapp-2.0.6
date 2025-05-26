import { cn } from "@genuin/ui/utils";

import { GroupNotificationButton } from "src/molecules/group-notification-button";
import { JoinGroupButton } from "src/molecules/join-group-button";
import { ShareButton } from "src/molecules/share-button";
import type { PostDetailsType } from "src/react-query/api/feed/schema";

type GroupDetailsProps = {
  groupDetails: PostDetailsType["group"];
};

export function GroupDetails({ groupDetails }: GroupDetailsProps) {
  // Moved loop details element into this component
  return (
    <li
      className={cn(
        "gencl:p-4 gencl:relative gencl:gap-2",
        "gencl:flex gencl:justify-between gencl:items-center",
        "gencl:border gencl:rounded-lg gencl:border-secondary-150"
      )}
    >
      <p className="gencl:text-body-0-semi-bold gencl:line-clamp-1">
        {groupDetails.name}
      </p>
      <div className="gencl:flex gencl:gap-2">
        <JoinGroupButton />
        <GroupNotificationButton />
        <ShareButton />
      </div>
    </li>
  );
}
