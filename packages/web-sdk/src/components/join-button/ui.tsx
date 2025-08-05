import { Button, ButtonProps } from '@/components/ui/button'
import { CommunityUserRole } from '../tree-structure/utils'
import { cn } from '@/utils'
import { Loader } from '../loader'

export type JoinButtonUiPropsType = {
  /**
   * Pass custom text for each role. If needed else default text will be used.
   */
  textForStates?: Partial<Record<CommunityUserRole, string>>
  role: CommunityUserRole
  isLoading?: boolean
} & ButtonProps

// default text values for each role
const DEFAULT_ROLE_TEXTS: Record<CommunityUserRole, string> = {
  UNJOINED: 'Join Community',
  MEMBER: 'Joined',
  REQUESTED: 'Requested',
  LEADER: '',
  MODERATOR: '',
}

export function JoinButtonUi({
  textForStates = {},
  role,
  isLoading,
  ...restProps
}: JoinButtonUiPropsType) {
  // If user is leader or moderator of the community, then don't show the join button.
  if (role === CommunityUserRole.LEADER || role === CommunityUserRole.MODERATOR)
    return

  // If user has requested to join the community, then show the requested button.
  if (role === CommunityUserRole.REQUESTED)
    return (
      <Button
        size='custom'
        className='border h-[32px] border-primary border-solid'
        variant='outline'
        title='Already requested!'>
        <p className='px-4 text-body-1-demi text-primary'>
          {textForStates.REQUESTED ?? DEFAULT_ROLE_TEXTS.REQUESTED}
        </p>
      </Button>
    )
  // According to design we have to go with text-white and stroke, as we can't use primary, secondary or tertiary colors
  return (
    <Button
      size='custom'
      className='h-[32px] rounded border border-solid border-primary px-4'
      variant={role === CommunityUserRole.MEMBER ? 'outline' : 'default'}
      {...restProps}>
      {isLoading ? (
        <Loader
          className={cn(
            role !== CommunityUserRole.UNJOINED ? 'fill-primary' : 'fill-white',
          )}
        />
      ) : (
        <p
          className={cn(
            'whitespace-nowrap text-body-1-demi',
            role === CommunityUserRole.MEMBER ? 'text-primary' : 'text-white',
          )}>
          {role === CommunityUserRole.MEMBER
            ? textForStates.MEMBER ?? DEFAULT_ROLE_TEXTS.MEMBER
            : textForStates.UNJOINED ?? DEFAULT_ROLE_TEXTS.UNJOINED}
        </p>
      )}
    </Button>
  )
}

export function JoinButtonPillUi({
  textForStates = {},
  role,
  isLoading,
  ...restProps
}: JoinButtonUiPropsType) {
  // If user is leader or moderator of the community, then don't show the join button.
  if (role === CommunityUserRole.LEADER || role === CommunityUserRole.MODERATOR)
    return

  // If user has requested to join the community, then show the requested button.
  if (role === CommunityUserRole.REQUESTED)
    return (
      <Button
        size='custom'
        className='ml-1 rounded-2xl bg-white px-3 py-1 text-cap-1-med'
        variant='outline'
        title='Already requested!'>
        <p className='px-4 text-center text-body-1-demi text-primary'>
          {textForStates.REQUESTED ?? DEFAULT_ROLE_TEXTS.REQUESTED}
        </p>
      </Button>
    )
  // According to design we have to go with text-white and stroke, as we can't use primary, secondary or tertiary colors
  return (
    <Button
      variant='custom'
      className='ml-1 flex rounded-2xl bg-white p-1 px-2 text-cap-1-med'
      {...restProps}>
      <div className='relative h-4 overflow-hidden'>
        <div
          className={cn(
            'flex w-fit flex-col transition-transform duration-300 ease-in-out',
            role === 'MEMBER' ? '-translate-y-[16px]' : 'translate-y-0',
          )}>
          <span className='h-4 text-black'>
            {textForStates.UNJOINED ?? DEFAULT_ROLE_TEXTS.UNJOINED}
          </span>
          <span className='h-4 text-black'>
            {textForStates.MEMBER ?? DEFAULT_ROLE_TEXTS.MEMBER}
          </span>
        </div>
      </div>
      {isLoading && <Loader className='h-4 w-4' />}
    </Button>
  )
}
