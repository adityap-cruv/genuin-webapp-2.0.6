import { CommunityIcon } from "@icons/community-icon";
import { EarthIcon } from "@icons/earth-icon";
import { IcLoop } from "@icons/ic-loop";

export function LoopPrivacyInfo({ actionId, accessTypeId }: { actionId: number; accessTypeId: number }) {
  if (actionId === 3 && accessTypeId === 5) {
    return (
      <div className="flex gap-1">
        <EarthIcon className="stroke-tertiary h-4 w-4" />
        <p className="text-cap-1-med text-tertiary line-clamp-1 break-all">Visible to everyone</p>
      </div>
    );
  }

  if (actionId === 4 && accessTypeId === 7) {
    return (
      <div className="flex gap-1">
        <CommunityIcon className="stroke-tertiary h-4 w-4" />
        <p className="text-cap-1-med text-tertiary line-clamp-1 break-all">Visible to community members only</p>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <IcLoop className="fill-tertiary stroke-tertiary h-4 w-4" />
      <p className="text-cap-1-med text-tertiary line-clamp-1 break-all">Visible to Group members only</p>
    </div>
  );
}
