import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import type { CommunityDetailsType, MembersSchemaType } from '@lib/schemas/community'
import { checkAndAppendHttps, getCurrentShareUrl, openGeneratedLink } from '@lib/utils'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import Link from 'next/link'
import icLink from '@icons/icLinkBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from '../../../layouts/mobile/top-bar'
import { CommunityLoopTab } from './community-loop-tab'
// import { useState } from 'react'
// import { joinCommunity, leaveCommunity, requestCommunity } from '@lib/api/video'
import { ShareIcon } from '@icons/share-icon'
import { useSearchParams } from 'next/navigation'
import { getCommunityMembers } from '@lib/api/community'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { Shimmer } from '@components/ui/shimmer'
import { LockIcon } from '@icons/LockIcon'
import { PrivateModal } from '@components/common/modals/private'
import { TickIcon } from '@icons/tick-icon'
import { BrandCommunityTag } from '@components/common/brand-community-tag'
import { InstagramIcon } from '@icons/instagram-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'
import { joinCommunityDeepLink } from '@/lib/get-deeplink'
import { TopStickyBar } from './top-sticky-bar'
import { ReadMore } from '@/components/common/read-more'
import { JoinCommunityButton } from '@components/common/join-community-button'

let communityDetailsModule: CommunityDetailsType

interface Props {
  communityDetails: CommunityDetailsType
}

const DETAIL_ELEMENT_ID = 'community-details'

export function Details({ communityDetails }: Props) {
  communityDetailsModule = communityDetails
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isEmbed } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))
  const searchParams = Object.fromEntries(useSearchParams())

  return (
    <>
      <TopBar />
      <TopStickyBar
        communityName={communityDetails.name ?? ''}
        communityProfileImage={communityDetails.dp_m ?? communityDetails.dp ?? ''}
        elementIdToTrack={DETAIL_ELEMENT_ID}
      />
      <div
        className="hide-scrollbar absolute inset-0 mt-navbar w-full overflow-auto"
        style={{ height: 'calc(100% - 74px)' }}>
        <div className="relative w-full bg-tertiary-200" style={{ height: 'calc(min(30vw, 400px))' }}>
          {' '}
          {communityDetails?.banner && (
            <Image src={communityDetails?.banner} alt="banner" fill className="object-cover" />
          )}
          <CustomAvatar
            imageUrl={communityDetails?.dp ?? ''}
            fallbackString={communityDetails?.name ?? ''}
            isAvatar={false}
            className="absolute bottom-0 left-4 h-20 w-20 translate-y-1/2 border-2 border-monochrome-white"
          />
        </div>
        <div className="px-4 py-2 pt-4">
          <div className="flex justify-end">
            <div className="flex items-center gap-x-2">
              <JoinCommunityButton
                buttonText="Join Community"
                handle={communityDetails.handle}
                id={communityDetails.community_id}
                role={communityDetails.logged_in_user_role}
                type={communityDetails.type === 2 ? 'private' : 'public'}
                communityName={communityDetails.name ?? ''}
              />
              {!isEmbed && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    await joinCommunityDeepLink({ communityName: communityDetails.name ?? '', searchParams }).then(
                      (generatedLink) => {
                        openGeneratedLink(generatedLink)
                      }
                    )
                  }}>
                  <p className="mx-2 text-body-1-bold text-monochrome-white">Join Community</p>
                </Button>
              )}
              <Button
                variant="outline"
                outlineColor="genuin-blue"
                size="sm"
                className="p-1"
                onClick={async () =>
                  await shareFn({
                    shareLink: getCurrentShareUrl({ url: communityDetails.share_url }),
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <ShareIcon className="h-6 w-6 fill-primary" />
              </Button>
              {/* <Button variant="outline" size="custom" className="border border-primary p-1">
                <Image src={icMore} alt="share" className="h-6 w-6" />
              </Button> */}
            </div>
          </div>
          <div id={DETAIL_ELEMENT_ID} className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center">
              <p className="my-1 mt-2 line-clamp-1 break-all text-title-3-bold ">{communityDetailsModule?.name}</p>
              {/* <p className="text-body-1-med text-tertiary">@{communityDetails.handle}</p> */}
              {communityDetailsModule.type === 2 && (
                <PrivateModal>
                  <div className="flex items-center justify-center rounded-full bg-tertiary-200 p-1 px-1.5">
                    <LockIcon className="h-4 w-4 stroke-tertiary" />
                    <p className="text-cap-1-demi text-tertiary">Private</p>
                  </div>
                </PrivateModal>
              )}
            </div>
            {communityDetailsModule.brand && (
              <BrandCommunityTag
                brandSlug={communityDetailsModule.brand.brand_slug}
                brandLogo={communityDetailsModule.brand?.logo}
                brandName={communityDetailsModule.brand?.name}
              />
            )}
          </div>
          <ReadMore.default
            text={communityDetailsModule?.description}
            maxChars={150}
            className="my-1  break-all text-body-1-demi"
          />
          <Stats />
        </div>
        {communityDetailsModule.type === 2 && !communityDetailsModule.logged_in_user_role ? (
          <div
            className="mt-4 flex w-full items-center justify-center overflow-hidden border-t border-tertiary-200"
            style={{ height: 'calc(100% - 220px)' }}>
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-tertiary-200 p-3">
                <Image src={icLock} alt="share" className="h-12 w-12" />
              </div>
              <p className="text-title-2-demi">This community is private</p>
              <p className="text-center text-body-1-med">
                Join this community to see and interact
                <br /> with their posts
              </p>
            </div>
          </div>
        ) : (
          <ProfileTabs />
        )}
      </div>
    </>
  )
}

function Stats() {
  return (
    <div className="flex items-center">
      <span className="pr-4">
        <span className="text-title-3-bold ">{communityDetailsModule?.no_of_members}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.no_of_members === 1 ? 'Member' : 'Members'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-3-bold ">{communityDetailsModule?.no_of_loops}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.no_of_loops === 1 ? 'Group' : 'Groups'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-3-bold ">{communityDetailsModule?.no_of_videos}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.no_of_videos === 1 ? 'Video' : 'Videos'}
        </span>
      </span>
    </div>
  )
}

function ProfileTabs() {
  return (
    <Tabs defaultValue="Loops" className="h-full">
      <TabsList className="sticky flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Groups</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-3-bold">Members</p>
        </TabsTrigger>
        <TabsTrigger value="About">
          <p className="text-title-3-bold">About</p>
        </TabsTrigger>
      </TabsList>
      <hr className="border-t border-tertiary-200" />
      <TabsContent value="Loops" className="mx-4 h-full">
        <CommunityLoopTab slug={communityDetailsModule.slug} />
      </TabsContent>
      <TabsContent value="About" className="mx-4">
        <Guidelines />
        <Categories />
        <Links />
        <Leaders />
      </TabsContent>
      <TabsContent value="Members" className="m-4">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function Guidelines() {
  if (communityDetailsModule.guidelines.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Guidelines</p>
        <>
          <Accordion type="single" collapsible>
            {communityDetailsModule?.guidelines.map((guideline: any, index: any) => {
              return (
                <div key={index}>
                  <AccordionItem value={guideline.title} className="border-none">
                    <AccordionTrigger className="my-1 p-0">
                      <p className="line-clamp-1 text-left text-body-1-med">
                        {index + 1}. {guideline.title}
                      </p>
                    </AccordionTrigger>
                    <AccordionContent className="w-[80%] pl-4">
                      <p className="line-clamp-2 text-left  text-tertiary">{guideline.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              )
            })}
          </Accordion>
        </>
      </div>
    )
}

function Categories() {
  if (communityDetailsModule.categories && communityDetailsModule.categories?.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Categories</p>
        {communityDetailsModule?.categories?.length === 0 && (
          <div className="flex items-center justify-center text-title-3-bold ">No categories available</div>
        )}
        <div>
          {communityDetailsModule?.categories?.map((cat, index) => {
            return (
              <p key={index} className="mx-1 my-1 inline-block rounded-full bg-tertiary-200 p-2 px-4 text-body-1-demi">
                <span className="line-clamp-1 break-all">{cat.title}</span>
              </p>
            )
          })}
        </div>
      </div>
    )
}

function Links() {
  const links = communityDetailsModule?.social_links
  if (links?.insta?.id ?? links?.linkedin?.id ?? links?.twitter?.id ?? links?.social_web_url)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Links</p>
        {!links?.insta?.id && !links?.linkedin?.id && !links?.twitter?.id && !links?.social_web_url && (
          <div className="flex items-center justify-center text-title-3-bold ">No links available</div>
        )}
        <div className="flex">
          {links?.insta?.id && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links?.insta?.url + links?.insta?.id)} target="_blank">
                <InstagramIcon className="h-5 w-5 fill-primary " />
              </Link>
            </div>
          )}
          {links?.linkedin?.id && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links?.linkedin?.url + links?.linkedin?.id)} target="_blank">
                <LinkedInIcon className="h-5 w-5 fill-primary " />
              </Link>
            </div>
          )}
          {links?.twitter?.id && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links?.twitter?.url + links?.twitter?.id)} target="_blank">
                <TwitterIcon className="h-5 w-5 fill-primary " />
              </Link>
            </div>
          )}
          {links?.social_web_url && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links.social_web_url)} target="_blank">
                <div className="flex">
                  <Image src={icLink} alt="web-site" />
                  <p className="text-body-1-demi">&nbsp;{links.social_web_url}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
}

function Leaders() {
  const leader = communityDetailsModule?.leader
  const moderators = communityDetailsModule?.moderators

  if (!leader || leader.nickname.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <p className="my-2 text-title-3-bold">Admins</p>
      <Link
        href={{
          pathname: leader.brand ? PATH_NAME.brand(leader.brand.brand_slug) : PATH_NAME.profile(leader.nickname),
        }}>
        <ListItem
          title={leader.name ?? ''}
          subtitle={'@' + leader.nickname}
          description={leader.bio ?? ''}
          image={leader.profile_image}
          isAvatar={leader.is_avatar}
          brand={leader.brand}
          isOwner={true}
        />
      </Link>
      {moderators.length > 0 &&
        moderators.map((item, index) => {
          return (
            <Link
              key={index}
              href={{
                pathname: item.brand ? PATH_NAME.brand(item.brand.brand_slug) : PATH_NAME.profile(item.nickname),
              }}>
              <ListItem
                title={item.name ?? ''}
                subtitle={'@' + item.nickname}
                description={item.bio ?? ''}
                image={item.profile_image_m ?? item.profile_image}
                isAvatar={item.is_avatar}
                brand={item.brand}
                isOwner={false}
              />
            </Link>
          )
        })}
    </div>
  )
}

function ListItem({
  title,
  subtitle,
  description,
  image,
  isAvatar,
  brand,
  isOwner,
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
  isAvatar: boolean
  isOwner: boolean
  brand?: {
    brand_id: number
    brand_slug: string
  } | null
}) {
  return (
    <div className="flex items-center gap-x-1 rounded-lg p-2">
      <CustomAvatar
        className="h-12 w-12 bg-red-40"
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={isAvatar}
      />
      <div className="mx-2">
        <div className="flex items-center gap-2">
          <p className="line-clamp-1 text-body-1-bold ">{subtitle}</p>
          {brand && (
            <div className="flex items-center gap-0.5">
              <TickIcon className="h-3 w-3 fill-primary" />
              <p className="text-cap-2-demi text-primary">Brand</p>
            </div>
          )}
          {isOwner && (
            <p className="flex items-center gap-1 rounded-full bg-primary-200 p-1 pr-1.5 text-primary ">Owner</p>
          )}
        </div>
        {subtitle && <p className="line-clamp-1 text-body-1-demi ">{title}</p>}
        {description && <p className="line-clamp-1 text-cap-1-demi text-tertiary">{description}</p>}
      </div>
    </div>
  )
}

function Members() {
  const { data, isLoading } = getCommunityMembers(communityDetailsModule.slug)
  const members = data?.members

  if (isLoading)
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="m-2 flex items-center justify-center">
            <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
            <div className="ml-2 w-full">
              <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
              <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
              <Shimmer className="my-1 h-4 w-full rounded-full" />
            </div>
          </div>
        ))}
      </>
    )

  if (members && members.length !== 0)
    return (
      <div>
        {/* <p className="my-2 text-title-3-bold">Members</p> */}
        {members.map((member: MembersSchemaType, index: number) => {
          if (member.nickname)
            return (
              <Link
                key={index}
                href={{
                  pathname: member.brand
                    ? PATH_NAME.brand(member.brand.brand_slug)
                    : PATH_NAME.profile(member.nickname),
                }}>
                <ListItem
                  title={member.name ?? ''}
                  subtitle={'@' + member.nickname}
                  description={member?.bio ?? ''}
                  image={member.profile_image}
                  isAvatar={member.is_avatar}
                  brand={member.brand ?? null}
                  isOwner={false}
                />
              </Link>
            )
          return null
        })}
      </div>
    )
}
