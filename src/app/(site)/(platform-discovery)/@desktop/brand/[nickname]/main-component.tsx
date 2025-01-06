'use client'
import React, { useEffect, useRef } from 'react'
import { abbreviateNumber, checkAndAppendHttps, getCurrentShareUrl } from '@lib/utils'
import { Button } from '@components/ui/button'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import { ShareIcon } from '@icons/share-icon'
import { type BrandSchemaType, type ProfileDetailsType } from '@lib/schemas/profile/profile'
import { CommunityList } from './community-list'
import { InstagramIcon } from '@icons/instagram-icon'
import { TikTokIcon } from '@icons/tiktok-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'
import Analytics from '@services/analytics'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { LinkIcon } from '@icons/link-icon'
import BrandBadgeIcon from '@/components/common/brand-badge-icon'

interface CompProps {
  profileData: ProfileDetailsType
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void Analytics.track({
      eventName: 'Brand Profile Opened',
      properties: {
        brand_id: profileData.brand?.brand_id,
        brand_slug: profileData.brand?.brand_slug,
      },
    })
  }, [])

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData.profile_image_m ?? profileData.profile_image}
        profileName={profileData.name ?? ''}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
        shareUrl={profileData.share_url}
        brandUserLogo={profileData.brand?.brand_user_logo ?? 1}
      />
      <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-4">
        <div className="mt-4 flex items-center justify-between">
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData.name ?? ''}
            imageUrl={profileData?.profile_image_m ?? profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div>
            <Links profileData={profileData} />
          </div>
        </div>
        <div className="w-1/2" ref={divRef}>
          <div className="flex items-center gap-x-2 py-1" ref={detailsDivRef}>
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 text-title-1-bold">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileData?.nickname}</p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 text-title-1-bold text-tertiary">@{profileData?.nickname}</p>
              </>
            )}
            {profileData.brand && (
              <BrandBadgeIcon userLogoType={profileData.brand?.brand_user_logo ?? 1} variant="dark" />
            )}
          </div>
          <p className="my-1 text-body-1-med">{profileData?.bio}</p>
          <Stats brandData={profileData.brand} />
        </div>
        <CommunityList brandId={profileData?.brand?.brand_id ?? 0} />
      </div>
      <Toaster />
    </>
  )
}

function Links({ profileData }: CompProps) {
  const links = {
    linkedin: profileData.linkedin_id ? profileData.linkedin_url + profileData.linkedin_id : undefined,
    instagram: profileData.insta_id ? profileData.insta_url + profileData.insta_id : undefined,
    twitter: profileData.twitter_id ? profileData.twitter_url + profileData.twitter_id : undefined,
    tiktok: profileData.tiktok_id ? profileData.tiktok_url + profileData.tiktok_id : undefined,
  }
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const brandId = useGenuinOptions().brandId

  return (
    <div className="my-2 flex items-center">
      {brandId && profileData.brand?.brand_id !== Number(brandId) && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(profileData.brand?.brand_url ?? '')} target="_blank">
            <LinkIcon className="h-5 w-5 stroke-primary " />
          </Link>
        </div>
      )}
      {links?.linkedin && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.linkedin)} target="_blank">
            <LinkedInIcon className="h-5 w-5 fill-primary " />
          </Link>
        </div>
      )}
      {links?.instagram && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.instagram)} target="_blank">
            <InstagramIcon className="h-5 w-5 fill-primary " />
          </Link>
        </div>
      )}
      {links?.twitter && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.twitter)} target="_blank">
            <TwitterIcon className="h-5 w-5 fill-primary " />
          </Link>
        </div>
      )}
      {links?.tiktok && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1 px-2">
          <Link href={checkAndAppendHttps(links.tiktok)} target="_blank">
            <TikTokIcon className="h-5 w-5 fill-primary " />
          </Link>
        </div>
      )}
      <Button
        variant="outline"
        size="custom"
        outlineColor="genuin-blue"
        className="mx-1 hover:border-primary-600"
        onClick={async () =>
          await shareFn({
            shareLink: getCurrentShareUrl({ url: profileData.share_url }),
            toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
          })
        }>
        <span className="flex items-center p-1">
          <ShareIcon className="h-6 w-6 fill-primary hover:fill-primary-600" />{' '}
        </span>
      </Button>
    </div>
  )
}

function Stats({ brandData }: { brandData: BrandSchemaType }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(Number(brandData?.views)) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(brandData?.videos ?? 0) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(brandData?.no_of_communities ?? 0) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Communities</p>
      </div>
    </div>
  )
}
