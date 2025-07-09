import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { MemberItem } from "@genuin/components/molecules/member-item";
import { PeopleTopResultType } from "@genuin/components/react-query/api/search";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { DialogClose } from "@genuin/ui/components/dialog";
import { urlGenerators } from "../../../shared";

type ProfilesTabProps = {
  profiles: PeopleTopResultType[];
} & ComponentProps<"div">;

export function ProfilesTab({
  profiles,
  className,
  ...restProps
}: ProfilesTabProps) {
  if (profiles.length === 0) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center ",
          className
        )}
        {...restProps}
      >
        <ComponentErrorState
          type="NO_MEMBERS"
          title="No profiles found"
          subtitle="Try searching with different keywords"
        />
      </div>
    );
  }

  return (
    <div className={cn("gencl:space-y-3", className)} {...restProps}>
      {profiles.map((profile) => {
        const memberData = {
          memberId: profile.user_id,
          url: urlGenerators.profile(profile.nickname, profile.brand),
          name: profile.name || profile.nickname || "",
          userName: profile.nickname || "",
          profileImage: {
            isAvatar: profile.is_avatar || false,
            url: profile.profile_image || "",
          },
          bio: profile.bio || "",
          brand: profile.brand ?? undefined,
          stats: {
            communities: profile.no_of_communities,
            groups: profile.no_of_loops,
            posts: profile.no_of_videos,
          },
        };

        return (
          <DialogClose key={profile.user_id} asChild>
            <MemberItem
              memberData={memberData}
              variant="suggestion"
              className="gencl:cursor-pointer gencl:hover:bg-secondary-50 gencl:rounded-md gencl:p-3"
            />
          </DialogClose>
        );
      })}
    </div>
  );
}
