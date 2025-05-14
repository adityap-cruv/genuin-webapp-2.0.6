import { type ComponentProps, memo, type ReactElement, useEffect, useId } from 'react'
// import {
//   type InfiniteQueryResultForTreeStructureType,
//   type CommunityType,
//   type FetchCommunityReturnType,
// } from '@components/tree-structure/types'
import { type CommunityType } from '@components/tree-structure/types'
import { CommunityNodeLoader, Loader } from './loader'
import { NoPosts } from './no-posts'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { BrandTag } from './brand-tag'
import { type CommunityUserRole } from './utils'
// import { useTreeStructure } from './context'
import Link from 'next/link'
import { CustomAvatar } from '../custom/custom-avatar'
import { cn } from '@/lib/utils'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { LockIcon } from '@icons/LockIcon'
import { GeneralError } from '../profile-new/general-error'
import { JoinCommunityButton } from '../common/actions/join-community-button'
import { useTreeStructure } from './context'

type CommunitiesNodePropsType = {
  communities?: CommunityType[]
  children?: Array<ReactElement<typeof CommunityItem>>
  // TODO ADD LATEST react-query VERSION
  queryResult: any
}

export const CommunitiesNode = memo(function CommunitiesNode({
  communities,
  queryResult: { fetchNextPage, hasNextPage, isError, isLoading, isFetching },
  children,
}: CommunitiesNodePropsType) {
  const lazyLoadElementId = useId()

  useEffect(() => {
    if (!hasNextPage) return
    const lastElement = document.getElementById(lazyLoadElementId)
    if (!lastElement) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        void fetchNextPage()
      }
    })
    observer.observe(lastElement)
    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, fetchNextPage])

  if (isLoading) return <Loader />

  if (isError) return <GeneralError />

  if (!communities || communities.length === 0) return <NoPosts />

  return (
    <>
      {children}
      {hasNextPage && <CommunityNodeLoader id={lazyLoadElementId} />}
    </>
  )
})

type CommunityNodePropsType = ComponentProps<'div'> & {
  communityDetails: Omit<CommunityType, 'loops'>
  onCommunityRoleChanged?: (newRole: CommunityUserRole) => void
}

export const CommunityItem = memo(function CommunityNode({
  communityDetails: { id, name, isPrivate, profileImage, role, slug, brand, handle, shareUrl },
  className,
  onCommunityRoleChanged,
  children,
  ...restProps
}: CommunityNodePropsType) {
  const { isSelfUser } = useTreeStructure()

  return (
    <div className={cn(className)} {...restProps}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={PATH_NAME.community(slug)}>
            <CustomAvatar isAvatar={false} imageUrl={profileImage} fallbackString={name} className="h-11 w-11" />
          </Link>
          <div>
            <div className="flex gap-1">
              <Link href={PATH_NAME.community(slug)}>
                <p className="line-clamp-1 text-body-1-bold md:text-title-3-bold" title={name}>
                  {name}
                </p>
              </Link>
              {brand && <BrandTag logo={brand.logo} name={brand.name} slug={brand.slug} />}
            </div>
            {isPrivate && <PrivateCommunityToolTip />}
          </div>
        </div>
        {/* Render only user him/her self is not there. */}
        {!isSelfUser && (
          <JoinCommunityButton
            buttonText="Join"
            handle={handle}
            communityName={name ?? ''}
            id={id}
            slug={slug}
            role={role}
            onStatusChange={(role) => {
              onCommunityRoleChanged?.(role as CommunityUserRole)
            }}
            type={isPrivate ? 'private' : 'public'}
            isMobile={false}
            shareUrl={shareUrl}
          />
        )}
      </div>
      {children}
    </div>
  )
})

const PrivateCommunityToolTip = memo(function PrivateCommunityToolTip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center justify-start rounded-full">
          <LockIcon className="h-4 w-4 stroke-tertiary" />
          <p className="text-cap-1-demi text-tertiary">Private</p>
        </TooltipTrigger>
        <TooltipContent className="w-64 bg-monochrome-black">
          <p className="text-center text-cap-1-med text-monochrome-white">
            This community is private. Only people approved by it's moderators can see and participate in this
            community.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
