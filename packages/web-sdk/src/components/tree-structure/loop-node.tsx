import { type ComponentProps, memo, type ReactElement } from 'react'
import type {
  FetchLoopReturnType,
  InfiniteQueryResultForTreeStructureType,
  LoopType,
} from './types'
import { cn } from '@/utils'
import { CommunityNodeLoader } from './loader'
import { DecorativeList } from '../decorative-list'
import { LoopIcon } from '../icons/loop-icon'
import { LoopPrivacyInfo } from '../loop-privacy-info'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type LoopListPropsType = {
  availableLoopCount: number
  totalLoopCount: number
  children: Array<ReactElement<typeof LoopItem>>
  queryResult: InfiniteQueryResultForTreeStructureType<FetchLoopReturnType>
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
      <div className='h-3' />
      {children}
      {isFetchingNextPage && (
        <li className='relative'>
          <CommunityNodeLoader />
        </li>
      )}
      {hasMoreLoops && !isFetchingNextPage && (
        <li
          onClick={() => fetchNextPage()}
          className='bg-tertiary-100 cursor-pointer w-full flex items-center justify-center border-solid border-tertiary-300 rounded-lg px-4 py-3 my-3 md:p-4 md:my-4 relative'>
          <p className='text-cap-1-demi text-tertiary'>See more groups</p>
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
  const pathName = usePathNameWithSubdomain()

  return (
    <li
      className={cn(
        'bg-tertiary-100 border-solid border-tertiary-300 rounded-lg px-4 py-3 my-3 md:p-4 md:my-4 relative',
        className,
      )}
      {...restProps}>
      {isPrivate ? (
        <PrivateLoop
          shareUrl={pathName.loop(slug)}
          name={name}
        />
      ) : (
        <>
          <div className='pb-4'>
            <CustomLink
              href={pathName.loop(slug)}
              target='_blank'
              title={name}>
              <p className='text-body-1-demi pb-1 md:text-title-3-bold line-clamp-1 '>
                {name}
              </p>
            </CustomLink>
            <LoopPrivacyInfo
              accessTypeId={privacyInfo[0].accessTypeId}
              actionId={privacyInfo[0].actionId}
            />
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
      <CustomLink href={shareUrl}>
        <p className='text-body-1-demi'>{name}</p>
      </CustomLink>
      <div className='my-1 flex items-center gap-1'>
        <LoopIcon className='h-6 w-6 fill-tertiary' />
        <p className='text-body-1-med text-tertiary'>
          Visible to Group members only
        </p>
      </div>
    </div>
  )
}
