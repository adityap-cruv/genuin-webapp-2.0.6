import { LockIcon } from '@/components/icons/lock-icon'
import {
  TooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

export function PrivateCommunityTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center justify-center rounded-full bg-tertiary-200 p-1 px-1.5'>
            <LockIcon className='h-4 w-4 stroke-tertiary' />
            <p className='text-cap-1-demi text-tertiary'>Private</p>
          </div>
        </TooltipTrigger>
        <TooltipContent className='w-64 bg-black'>
          <p className='text-center text-cap-1-med text-white'>
            This community is private. Only people approved by it's moderators
            can see and participate in this community.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PrivateCommunityContent() {
  return (
    <div
      className='mt-4 flex w-full items-center justify-center overflow-hidden'
      style={{ height: 'calc(100% - 285px)', backgroundColor: '#F9F9F9' }}>
      <div className='flex flex-col items-center justify-center'>
        <LockIcon className='h-16 w-16 stroke-tertiary' />
        <p className='text-title-2-demi'>This community is private</p>
        <p className='text-center text-body-1-med'>
          Join this community to see and interact
          <br /> with their posts
        </p>
      </div>
    </div>
  )
}
