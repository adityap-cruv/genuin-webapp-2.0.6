'use client'
import { abbreviateNumber, checkAndAppendHttps, getCurrentShareUrl } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useEffect, useRef } from 'react'
import { TopBar } from '@components/layouts/mobile/top-bar'
import Link from 'next/link'
import { useInView, useScroll } from 'framer-motion'
import { TopStickyBar } from '../../../@desktop/profile/[nickname]/top-bar'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { useCommunityListStore } from './store'
import { ShareIcon } from '@icons/share-icon'
import { type ProfileDetailsType } from '@lib/schemas/profile/profile'
import { CommunityList } from './community-list'
import { TickIcon } from '@icons/tick-icon'
import { InstagramIcon } from '@icons/instagram-icon'
import { TikTokIcon } from '@icons/tiktok-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'

interface CompProps {
  profileData: ProfileDetailsType
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  const resetData = useCommunityListStore((state) => state.reset)

  useEffect(() => {
    return () => {
      resetData()
    }
  }, [])

  return (
    <>
      <TopBar variant={'light'} />
      <TopStickyBar.mobile
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData.profile_image}
        profileName={profileData?.name ?? ''}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
        shareUrl={profileData.share_url}
      />
      <div
        ref={scrollDivRef}
        className="hide-scrollbar absolute inset-0 mt-navbar w-full overflow-auto"
        style={{ height: 'calc(100% - 74px)' }}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <CustomAvatar
              className="bg-slate-500 h-20 w-20 bg-red-40"
              fallbackString={profileData?.name ?? ''}
              imageUrl={profileData?.profile_image}
              isAvatar={profileData?.is_avatar}
            />
            <div className="flex">
              {/* <Button
                className="mr-2"
                variant="outline"
                size="sm"
                outlineColor="genuin-blue"
                onClick={async () =>
                  await shareFn({
                    shareLink: window.location.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <p className="text-body-1-bold text-blue">Edit Profile</p>
              </Button> */}
              <Button
                variant="outline"
                size="custom"
                outlineColor="genuin-blue"
                className="p-1.5"
                onClick={async () =>
                  await shareFn({
                    shareLink: getCurrentShareUrl({ url: profileData.share_url }),
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <ShareIcon className="h-6 w-6 fill-primary" />
              </Button>
            </div>
          </div>
          <div ref={detailsDivRef} className="mt-2 flex items-center">
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-3-bold">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileData.nickname}</p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-3-bold text-tertiary">@{profileData.nickname}</p>
              </>
            )}
            {profileData.brand && (
              <div className="ml-2 flex items-center gap-1 rounded-full bg-primary-200 p-1 px-1.5">
                <TickIcon className="h-4 w-4 fill-primary" />
                <p className="text-cap-1-demi text-primary">Brand</p>
              </div>
            )}
          </div>
          <p className="my-1 line-clamp-2 text-body-1-demi">{profileData?.bio}</p>
          <Stats profileData={profileData} />
          <Links profileData={profileData} />
        </div>
        <hr className="my-1 border-t border-tertiary-200" />
        <CommunityList brandId={profileData?.brand?.brand_id ?? 0} scrollYProgress={scrollYProgress} />
      </div>
      {/* <PlayerModalWrapper /> */}
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

  return (
    <div className="mt-2 flex">
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
    </div>
  )
}

function Stats({ profileData }: CompProps) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-2 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(Number(profileData?.views)) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(profileData?.videos) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(profileData?.no_of_communities) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Communities</p>
      </div>
    </div>
  )
}
