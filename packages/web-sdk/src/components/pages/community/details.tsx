import { CustomImage } from '@/components/custom-image'
import { CommunityDetailsType } from './schema'
import { CustomAvatar } from '@/components/custom-avatar'
import ShareButton from '../../share-button'
import { BrandCommunityTag } from '@/components/brand-community-tag'
import { ReadMoreDynamic } from '@/components/read-more'
import { Stats } from '@/components/stats'
import { JoinButton } from '@/components/join-button'
import { mapCommunityUserRole } from '@/components/tree-structure'
import { AuthenticationModal } from '@/components/authentication'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForCommunityDetails } from '@/utils/constants/keys'
import { useSizeContext } from '@/context/size'
import { DetailsTabs } from './details-tab'
import { Leaders } from './leaders'
import { Guidelines } from './guidelines'
import { PrivateCommunityContent, PrivateCommunityTooltip } from './private'
import { Links } from './links'
type DetailsPropsType = {
  communityDetails: CommunityDetailsType
  /**
   * Id of element based on which top bar will be shown.
   */
  detailsId: string
}
export function Details({ communityDetails, detailsId }: DetailsPropsType) {
  const isPrivate = communityDetails.type === 2
  const queryClient = useQueryClient()

  const handleCommunityJoinClick = useCallback(async () => {
    await queryClient.invalidateQueries({
      exact: true,
      queryKey: getQueryKeyForCommunityDetails(communityDetails.slug),
    })
  }, [])

  return (
    <main className='__gen__sdk__hide__scrollbar h-full w-full overflow-x-clip overflow-auto'>
      <div
        id={detailsId}
        className='md:px-6 px-4'>
        <div className='px-[-16px] md:px-[-24px] aspect-w-5 aspect-h-1 w-full relative h-32 md:h-40  rounded-b-lg bg-tertiary-200'>
          {communityDetails?.banner && (
            <CustomImage
              src={communityDetails?.banner}
              alt='banner'
              className='object-fill absolute inset-0 h-full w-full'
            />
          )}
          <CustomAvatar
            isAvatar={false}
            imageUrl={communityDetails.dp ?? ''}
            fallbackString={communityDetails.name ?? ''}
            className='absolute -bottom-14 left-6 h-20 w-20 border-2 border-white text-new-h2 font-medium'
          />
        </div>
        <div className='my-3 flex items-center justify-end gap-x-2'>
          <JoinButton
            communitySlug={communityDetails.slug}
            communityId={communityDetails.community_id}
            role={mapCommunityUserRole(
              communityDetails.logged_in_user_role,
              communityDetails.is_community_join_requested,
            )}
            isPrivate={isPrivate}
            onCommunityRoleChanged={async () => {
              await handleCommunityJoinClick()
            }}
            fallbackFunc={() => {
              AuthenticationModal.open()
            }}
          />
          <ShareButton url={communityDetails.share_url} />
        </div>
        <div className='flex items-center gap-x-2 py-2'>
          <p className='text-title-3-bold line-clamp-1 break-all md:text-title-1-bold'>
            {communityDetails.name}
          </p>
          <p className='hidden md:block text-body-1-med text-tertiary'>
            @{communityDetails.handle}
          </p>
          {/** if the community is private than show tooltip */}
          {isPrivate && <PrivateCommunityTooltip />}
          {/* if the community is in the brand. */}
          {communityDetails.brand && (
            <BrandCommunityTag
              className='hidden md:block'
              brandSlug={communityDetails.brand.brand_slug}
              brandLogo={communityDetails.brand?.logo}
              brandName={communityDetails.brand?.name}
            />
          )}
        </div>
      </div>
      {isPrivate && !communityDetails.logged_in_user_role ? (
        <PrivateCommunityContent />
      ) : (
        <CommunityContent communityDetails={communityDetails} />
      )}
    </main>
  )
}

function CommunityContent({
  communityDetails,
}: {
  communityDetails: CommunityDetailsType
}) {
  const { isMobile } = useSizeContext()

  return (
    <div className='grid w-full gap-4 px-4 md:px-6 grid-cols-1 md:grid-cols-2'>
      <div className='snap-y snap-proximity __gen__sdk__hide__scrollbar overflow-hidden md:overflow-auto overflow-x-hidden scroll-smooth pb-16'>
        {communityDetails.description && (
          <ReadMoreDynamic
            position='outside'
            text={communityDetails.description ?? ''}
            maxLines={2}
            className='mb-2 text-secondary'
          />
        )}
        {communityDetails.brand && isMobile && (
          <div className='flex gap-2 items-center mb-2'>
            <p className='text-cap-1-demi text-tertiary'>Posted in</p>
            <BrandCommunityTag
              brandSlug={communityDetails.brand.brand_slug}
              brandLogo={communityDetails.brand?.logo}
              brandName={communityDetails.brand?.name}
            />
          </div>
        )}
        <Stats
          values={{
            Members: communityDetails.no_of_members,
            Groups: communityDetails.no_of_loops,
            Videos: communityDetails.no_of_videos,
          }}
        />
        <DetailsTabs
          slug={communityDetails.slug}
          guidelines={communityDetails.guidelines}
          leader={communityDetails.leader}
          moderators={communityDetails.moderators}
          socialLinks={communityDetails.social_links}
        />
      </div>
      {!isMobile && (
        <div className='snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth'>
          <Links socialLinks={communityDetails.social_links} />
          <Guidelines guidelines={communityDetails.guidelines} />
          <Leaders
            leader={communityDetails.leader}
            moderators={communityDetails.moderators}
          />
        </div>
      )}
    </div>
  )
}
// TODO: Have a discussion with the team about the implementation of the Links component.
// function Categories({ categories }: { categories: any[] }) {
//   if (categories && categories?.length === 0) return

//   return (
//     <div className='mb-4'>
//       <p className='my-2 text-title-3-bold'>Categories</p>
//       <div>
//         {categories?.map((cat, index) => {
//           return (
//             <p
//               key={index}
//               className='my-1 mr-1 inline-block rounded-full bg-tertiary-200 p-2 px-4 text-body-1-med'>
//               <span className='line-clamp-1 break-all'>{cat.title}</span>
//             </p>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
