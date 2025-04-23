import { type ComponentProps, memo } from 'react'
// import type { FetchLoopReturnType, InfiniteQueryResultForTreeStructureType, LoopType } from './types'
import type { LoopType } from './types'
import { DecorativeList } from '../custom/decorative-list'
import { CommunityNodeLoader } from './loader'
import { cn } from '@/lib/utils'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { LoopPrivacyInfo } from './loop-privacy-info'
import { IcLoop } from '@icons/ic-loop'

type LoopListPropsType = {
  availableLoopCount: number
  totalLoopCount: number
  // TODO ADD CHILDREN TYPE
  children: any
  // TODO ADD LATEST react-query VERSION
  queryResult: any
}

export const LoopNode = memo(function LoopNode({
  availableLoopCount,
  totalLoopCount,
  children,
  queryResult: { fetchNextPage, isFetchingNextPage },
}: LoopListPropsType) {
  const hasMoreLoops = totalLoopCount - availableLoopCount > 0

  return (
    <DecorativeList>
      <div className="h-3" />
      {children}
      {isFetchingNextPage && (
        <li className="relative">
          <CommunityNodeLoader />
        </li>
      )}
      {hasMoreLoops && !isFetchingNextPage && (
        <li
          onClick={() => {
            void fetchNextPage()
          }}
          className="relative my-3 flex w-full cursor-pointer items-center justify-center rounded-lg border-solid border-tertiary-300 bg-tertiary-100 px-4 py-3 md:my-4 md:p-4">
          <p className="text-cap-1-demi text-tertiary">See more groups</p>
        </li>
      )}
    </DecorativeList>
  )
})

type LoopNodePropsType = ComponentProps<'li'> & { loopDetails: LoopType }

export const LoopItem = memo(function LoopNode({
  loopDetails: { name, isPrivate, privacyInfo, slug },
  className,
  children,
  ...restProps
}: LoopNodePropsType) {
  return (
    <li
      className={cn(
        'relative my-3 rounded-lg border-solid border-tertiary-300 bg-tertiary-100 px-4 py-3 md:my-4 md:p-4',
        className
      )}
      {...restProps}>
      {isPrivate ? (
        <PrivateLoop shareUrl={PATH_NAME.loop(slug)} name={name} />
      ) : (
        <>
          <div className="pb-4">
            <Link href={PATH_NAME.loop(slug)} title={name}>
              <p className="line-clamp-1 pb-1 text-body-1-demi md:text-title-3-bold ">{name}</p>
            </Link>
            <LoopPrivacyInfo accessTypeId={privacyInfo[0].accessTypeId} actionId={privacyInfo[0].actionId} />
          </div>
          {children}
        </>
      )}
    </li>
  )
})

function PrivateLoop({ shareUrl, name }: { shareUrl: string; name: string }) {
  return (
    <div>
      <Link href={shareUrl}>
        <p className="text-body-1-demi">{name}</p>
      </Link>
      <div className="my-1 flex items-center gap-1">
        <IcLoop className="h-4 w-4 fill-tertiary stroke-tertiary" />
        <p className="text-body-1-med text-tertiary">Visible to Group members only</p>
      </div>
    </div>
  )
}
