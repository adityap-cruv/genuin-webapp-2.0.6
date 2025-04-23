import {
  type ComponentProps,
  memo,
  type ReactElement,
  useEffect,
  useId,
} from 'react'
import {
  InfiniteQueryResultForTreeStructureType,
  type CommunityType,
  type FetchCommunityReturnType,
} from './types'
import { cn } from '@/utils'
import { CustomAvatar } from '../custom-avatar'
import { useTreeStructure } from './context'
import { CommunityNodeLoader, Loader } from './loader'
import { JoinButton } from '../join-button'
import { NoPosts } from './no-posts'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip'
import { LockIcon } from '../icons/lock-icon'
import { CommunityUserRole } from './utils'
import { BrandTag } from './brand-tag'
import { AuthenticationModal } from '../authentication'
import { GeneralError } from '../general-error'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type CommunitiesNodePropsType = {
  communities?: CommunityType[]
  children?: Array<ReactElement<typeof CommunityItem>>
  queryResult: InfiniteQueryResultForTreeStructureType<FetchCommunityReturnType>
}

export const CommunitiesNode = memo(function CommunitiesNode({
  communities,
  queryResult: { fetchNextPage, hasNextPage, isError, isLoading },
  children,
}: CommunitiesNodePropsType) {
  const lazyLoadElementId = useId()

  useEffect(() => {
    if (!hasNextPage) return
    const lastElement = document.getElementById(lazyLoadElementId)
    if (!lastElement) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage()
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
  communityDetails: { id, name, isPrivate, profileImage, role, slug, brand },
  className,
  onCommunityRoleChanged,
  children,
  ...restProps
}: CommunityNodePropsType) {
  const { isSelfUser } = useTreeStructure()
  const pathName = usePathNameWithSubdomain()

  return (
    <div
      className={cn(className)}
      {...restProps}>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <CustomLink
            href={pathName.community(slug)}
            target='_blank'>
            <CustomAvatar
              isAvatar={false}
              imageUrl={profileImage}
              fallbackString={name}
              className='w-11 h-11'
            />
          </CustomLink>
          <div>
            <div className='flex gap-1'>
              <CustomLink
                href={pathName.community(slug)}
                target='_blank'>
                <p
                  className='text-body-1-bold md:text-title-2-demi line-clamp-1'
                  title={name}>
                  {name}
                </p>
              </CustomLink>
              {brand && (
                <BrandTag
                  logo={brand.logo}
                  name={brand.name}
                  slug={brand.slug}
                />
              )}
            </div>
            {isPrivate && <PrivateCommunityToolTip />}
          </div>
        </div>
        {/* Render only user him/her self is not there. */}
        {!isSelfUser && (
          <JoinButton
            communitySlug={slug}
            textForStates={{
              UNJOINED: 'Join',
            }}
            communityId={id}
            role={role}
            isPrivate={isPrivate}
            forEmbed
            onCommunityRoleChanged={(newRole) => {
              onCommunityRoleChanged?.(newRole)
            }}
            fallbackFunc={() => {
              AuthenticationModal.open()
            }}
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
        <TooltipTrigger className='flex items-center justify-start rounded-full'>
          <LockIcon className='h-4 w-4 stroke-tertiary' />
          <p className='text-cap-1-demi text-tertiary'>Private</p>
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
})
