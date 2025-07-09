import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { GroupCard } from "@genuin/components/organisms/group-card";
import { LoopTopResultType } from "@genuin/components/react-query/api/search";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { urlGenerators } from "../../../shared";
import { mapGroupJoinStatus } from "@genuin/components/lib/utils";
import { updateGroupJoinStatusInSearchResults } from "@genuin/components/react-query/api/search";
import { GroupUserStatusType } from "@genuin/components/types/roles";

type GroupsTabProps = {
  groups: LoopTopResultType[];
  query: string;
} & ComponentProps<"div">;

export function GroupsTab({
  groups,
  query,
  className,
  ...restProps
}: GroupsTabProps) {
  if (groups.length === 0) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center ",
          className
        )}
        {...restProps}
      >
        <ComponentErrorState
          type="NO_GROUPS"
          subtitle="Try searching with different keywords"
        />
      </div>
    );
  }

  return (
    <div className={cn("gencl:space-y-3", className)} {...restProps}>
      {groups.map((group) => (
        <GroupCard
          key={group.chat_id}
          owner={{
            userName: "owner",
            url: "",
          }}
          group={{
            chat_id: group.chat_id || "",
            name: group.group.group_name || "",
            isPrivate: !group.is_view_allowed,
            url: urlGenerators.group(group.slug || ""),
            slug: group.group.slug || "",
            description: group.group.group_description || "",
            role: mapGroupJoinStatus(group.logged_in_user_status),
            stats: {
              members: group.group.no_of_members,
              posts: group.group.no_of_videos,
              views: group.group.no_of_views,
            },
          }}
          variant="search"
          url={urlGenerators.group(group.slug || "")}
          shouldCloseModal={true}
          onGroupJoinStatusChange={(newRole: GroupUserStatusType) => {
            // Update the group join status in search results
            updateGroupJoinStatusInSearchResults(query, group.chat_id, newRole);
          }}
        />
      ))}
    </div>
  );
}
