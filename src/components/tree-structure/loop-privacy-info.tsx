import { CommunityIcon } from '@icons/community-icon'
import { EarthIcon } from '@icons/earth-icon'
import { IcLoop } from '@icons/ic-loop'

/**
 * Component that displays privacy information for a loop based on action and access type IDs
 *
 * @param actionId - The type of action (3: Public, 4: Community, others: Group)
 * @param accessTypeId - The type of access (5: Everyone, 7: Community Members, others: Group Members)
 * @returns JSX element with appropriate icon and privacy text
 *
 * Privacy Types:
 * - Public (actionId: 3, accessTypeId: 5): Visible to everyone
 * - Community (actionId: 4, accessTypeId: 7): Visible to community members
 * - Group (default): Visible to group members only
 */
export function LoopPrivacyInfo({ actionId, accessTypeId }: { actionId: number; accessTypeId: number }) {
  if (actionId === 3 && accessTypeId === 5) {
    return (
      <div className="flex gap-1">
        <EarthIcon className="h-4 w-4 stroke-tertiary" />
        <p className="line-clamp-1 break-all text-cap-1-med text-tertiary">Visible to everyone</p>
      </div>
    )
  }

  if (actionId === 4 && accessTypeId === 7) {
    return (
      <div className="flex gap-1">
        <CommunityIcon className="h-4 w-4 stroke-tertiary" />
        <p className="line-clamp-1 break-all text-cap-1-med text-tertiary">Visible to community members only</p>
      </div>
    )
  }

  return (
    <div className="flex gap-1">
      <IcLoop className="h-4 w-4 fill-tertiary stroke-tertiary" />
      <p className="line-clamp-1 break-all text-cap-1-med text-tertiary">Visible to Group members only</p>
    </div>
  )
}
