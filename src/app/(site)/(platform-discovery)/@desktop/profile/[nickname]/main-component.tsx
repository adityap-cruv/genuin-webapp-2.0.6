'use client'
import { abbreviateNumber, checkAndAppendHttps, getCurrentShareUrl, openModal } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CustomAvatar } from '@components/custom/custom-avatar'

import React, { useEffect, useRef } from 'react'

import icInstagram from '@icons/icInstagramBlack.svg'
import icTiktok from '@icons/icTiktok.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import { useCommunityListStore } from './store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ShareIcon } from '@icons/share-icon'
import { type ProfileDetailsType } from '@lib/schemas/profile/profile'
import { CommunityList } from './community-list'
import { PATH_NAME } from '@lib/utils/constants/path'
import { usePathname } from 'next/navigation'
import { TickIcon } from '@icons/tick-icon'

interface CompProps {
  profileData: ProfileDetailsType
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { reset: resetData } = useCommunityListStore()
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      resetData()
    }
  }, [])

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData.profile_image}
        profileName={profileData.name ?? ''}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
      />
      <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-4">
        <div className="mt-4 flex items-center justify-between">
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData.name ?? ''}
            imageUrl={profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div>
            <Links profileData={profileData} />
          </div>
        </div>
        <div className="w-1/2" ref={divRef}>
          <div className="flex items-center py-1" ref={detailsDivRef}>
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileData?.nickname}</p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold text-tertiary">@{profileData?.nickname}</p>
              </>
            )}
          </div>

          <p className="my-1 line-clamp-2 break-all text-body-1-med">{profileData?.bio}</p>
          <Stats profileData={profileData} />
        </div>
        <CommunityList userId={profileData.user_id} />
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
  const pathName = usePathname()
  const { isEmbed, parentUrl, user } = useGenuinOptions((state) => ({
    isEmbed: state.embed,
    parentUrl: state.parentUrl,
    user: state.user,
  }))

  return (
    <div className="flex items-center gap-1">
      {links?.linkedin && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.linkedin)} target="_blank">
            <Image src={icLinkedIn} alt="linkedin" />
          </Link>
        </div>
      )}
      {links?.instagram && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.instagram)} target="_blank">
            <Image src={icInstagram} alt="instagram" />
          </Link>
        </div>
      )}
      {links?.twitter && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.twitter)} target="_blank">
            <Image src={icTwitter} alt="twitter" />
          </Link>
        </div>
      )}
      {links?.tiktok && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1 px-2">
          <Link href={checkAndAppendHttps(links.tiktok)} target="_blank">
            <Image src={icTiktok} alt="linkedin" />
          </Link>
        </div>
      )}
      {pathName === PATH_NAME.profile(user?.nickname) && (
        <Link href={PATH_NAME.settings('edit')}>
          <Button
            size="custom"
            variant="outline"
            className="border border-primary"
            onClick={() => {
              localStorage.setItem('previous_path', pathName)
            }}>
            <p className="px-4 py-1 text-title-3-bold text-primary" style={{ fontSize: '15px' }}>
              Edit Profile
            </p>
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        size="custom"
        outlineColor="genuin-blue"
        className="mx-1 hover:border-primary-600"
        onClick={async () =>
          await shareFn({
            shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
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

function Stats({ profileData }: { profileData: ProfileDetailsType }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(Number(profileData?.views)) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(profileData?.videos) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold">{abbreviateNumber(profileData?.no_of_communities) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Communities</p>
      </div>
    </div>
  )
}
