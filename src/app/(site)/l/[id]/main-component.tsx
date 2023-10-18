'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { getAvatarFallback } from '@lib/utils'

// todo work on this when api gets updated.
export function MainComponent({ loopDetails = null }: { loopDetails: any }) {
  console.log('loop details::', loopDetails)
  return (
    <div className="flex w-full">
      <div className="max-w-xs">
        <div>
          <Avatar className="h-20 w-20">
            <AvatarImage src={loopDetails.group.dp} />
            <AvatarFallback>{getAvatarFallback(loopDetails.group.group_name)}</AvatarFallback>
          </Avatar>
          <p>{loopDetails.group.group_name}</p>
        </div>
      </div>
      <div>
        <div>videos</div>
        <div>member</div>
      </div>
    </div>
  )
}
