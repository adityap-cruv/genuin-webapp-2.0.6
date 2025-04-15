import { CustomAvatar } from '@/components/custom/custom-avatar'
import { type ProfileDetailsType } from '@/lib/schemas/profile/profile'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { type ComponentProps, memo } from 'react'
import { Links } from './links'
import ShareButton from '@/components/common/actions/ShareButton'
import BrandBadgeIcon from '@/components/common/brand-badge-icon'
import { cn } from '@/lib/utils'
import { Stats } from './stats'

type DetailsPropsType = {
  profileDetails: ProfileDetailsType
} & ComponentProps<'div'>

export const Details = memo(function Details({ profileDetails, className, ...restProps }: DetailsPropsType) {
  const { config } = useGenuinOptions()
  const links = {
    linkedin: profileDetails.linkedin_id ? profileDetails.linkedin_url + profileDetails.linkedin_id : undefined,
    instagram: profileDetails.insta_id ? profileDetails.insta_url + profileDetails.insta_id : undefined,
    twitter: profileDetails.twitter_id ? profileDetails.twitter_url + profileDetails.twitter_id : undefined,
    tiktok: profileDetails.tiktok_id ? profileDetails.tiktok_url + profileDetails.tiktok_id : undefined,
    ...(Number(config?.brand_id) !== profileDetails?.brand?.brand_id && {
      webUrl: profileDetails.brand?.brand_url,
    }),
  }

  return (
    <div className={cn('h-min w-full px-4', className)} {...restProps}>
      <div className="mt-4 flex items-center justify-between">
        <CustomAvatar
          className="h-20 w-20 bg-red-40"
          fallbackString={profileDetails.name ?? ''}
          imageUrl={profileDetails?.profile_image}
          isAvatar={profileDetails?.is_avatar}
        />
        <div className="flex items-center">
          <Links className="hidden md:flex" links={links} />
          <ShareButton url={profileDetails.share_url} />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-x-2 py-1">
          <p className="line-clamp-1 text-title-3-bold md:text-title-1-bold">
            {profileDetails?.name ? profileDetails?.name : `@${profileDetails?.nickname}`}
          </p>
          {profileDetails.name && (
            <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileDetails?.nickname}</p>
          )}
          {profileDetails.brand && (
            <BrandBadgeIcon userLogoType={profileDetails.brand?.brand_user_logo ?? 1} variant="dark" />
          )}
        </div>
        <p
          className="my-1 text-body-1-demi md:text-body-1-med"
          style={{
            wordBreak: 'break-word',
          }}>
          {profileDetails?.bio}
        </p>
        <Stats
          values={{
            Views: Number(profileDetails?.brand?.views ?? profileDetails.views),
            Posts: Number(profileDetails?.brand?.videos ?? profileDetails.videos),
            Communities: Number(profileDetails?.brand?.no_of_communities ?? profileDetails.no_of_communities),
          }}
        />
        <Links className="flex md:hidden" links={links} />
      </div>
    </div>
  )
})
