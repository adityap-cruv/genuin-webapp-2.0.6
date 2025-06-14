import { CommunityIcon, PublicIcon, GroupIcon } from "@genuin/ui/icons";

export function GroupPrivacyInfo({
  actionId,
  accessTypeId,
}: {
  actionId: number;
  accessTypeId: number;
}) {
  if (actionId === 3 && accessTypeId === 5) {
    return (
      <div className="gencl:flex gencl:gap-1">
        <PublicIcon className="gencl:h-4 gencl:w-4 gencl:stroke-secondary-600" />
        <p className="gencl:line-clamp-1 gencl:break-all gencl:text-body-2-medium gencl:text-secondary-600">
          Visible to everyone
        </p>
      </div>
    );
  }

  if (actionId === 4 && accessTypeId === 7) {
    return (
      <div className="gencl:flex gencl:gap-1">
        <CommunityIcon className="gencl:h-4 gencl:w-4 gencl:stroke-secondary-600" />
        <p className="gencl:line-clamp-1 gencl:break-all gencl:text-body-2-medium gencl:text-secondary-600">
          Visible to community members only
        </p>
      </div>
    );
  }

  return (
    <div className="gencl:flex gencl:gap-1">
      <GroupIcon className="gencl:h-4 gencl:w-4 gencl:fill-secondary-600" />
      <p className="gencl:line-clamp-1 gencl:break-all gencl:text-body-2-medium gencl:text-secondary-600">
        Visible to Group members only
      </p>
    </div>
  );
}
