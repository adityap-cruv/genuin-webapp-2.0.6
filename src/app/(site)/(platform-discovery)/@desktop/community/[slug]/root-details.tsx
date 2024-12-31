'use client'
import type { CommunityDetailsType, MembersSchemaType } from '@lib/schemas/community'
import { useEffect, useRef } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopStickyBar } from './top-sticky-bar'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import { useInView } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import Link from 'next/link'
import { checkAndAppendHttps, mapCommunityUserRole } from '@lib/utils'
import icLink from '@icons/icLinkBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { Toaster } from '@components/ui/toaster'
import { ListItem } from '@components/common/list-item'
import { getCommunityDetails, getCommunityMembers } from '@lib/api/community'
import { Shimmer } from '@components/ui/shimmer'
import { LockIcon } from '@icons/LockIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { BrandCommunityTag } from '@components/common/brand-community-tag'
import { InstagramIcon } from '@icons/instagram-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'
import { CommunityLoopTab } from './community-loop-tab'
import Loader from './loading'
import { CustomImage } from '@/components/custom/custom-image'
import { ReadMore } from '@/components/common/read-more'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'
import EmptyView from '@/components/common/empty-view'
import ShareButton from '@components/common/actions/ShareButton'
import { JoinCommunityButton } from '@/components/common/join-community-button'

export function CommunityDetails({ slug }: { slug: string }) {
  const { data, isLoading, error } = getCommunityDetails(slug)

  if (isLoading) return <Loader />
  if (error) {
    if ((error as Error).message === NOT_FOUND_ERROR_CODES.community) {
      return <EmptyView type="community" />
    }
  }
  if (data) return <RootDetails communityDetails={data} />
}

// TODO: Separate this component.
function RootDetails({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  const addCommunity = useLocalStorage((state) => state.addCommunity)
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })

  useEffect(() => {
    addCommunity({
      handle: communityDetails.handle,
      name: communityDetails.name ?? '',
      profileImage: communityDetails.dp ?? '',
      slug: communityDetails.slug,
    })
  }, [])

  return (
    <>
      <TopStickyBar
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.name ?? ''}
        communityProfileImage={communityDetails.dp_m ?? communityDetails.dp ?? ''}
        communityHandle={communityDetails.handle}
        role={mapCommunityUserRole(communityDetails.logged_in_user_role, communityDetails.is_community_join_requested)}
        communityId={communityDetails.community_id}
        shareUrl={communityDetails.share_url}
        isCommunityPrivate={communityDetails.type === 2}
        isJoinRequested={communityDetails.is_community_join_requested}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto">
        <div>
          <div className="-px-6 aspect-w-5 aspect-h-1 relative h-40  rounded-b-lg bg-tertiary-200">
            {communityDetails?.banner && (
              <CustomImage src={communityDetails?.banner} alt="banner" fill className="object-cover" />
            )}
            <CustomAvatar
              isAvatar={false}
              imageUrl={communityDetails.dp ?? ''}
              fallbackString={communityDetails.name ?? ''}
              className="absolute -bottom-14 left-6 h-20 w-20 border-2 border-monochrome-white text-new-h2 font-medium"
            />
          </div>
          <div ref={detailsDivRef} className="my-3 flex items-center justify-end gap-x-2">
            <JoinCommunityButton
              buttonText="Join Community"
              handle={communityDetails.handle}
              communityName={communityDetails.name ?? ''}
              id={communityDetails.community_id}
              role={mapCommunityUserRole(
                communityDetails.logged_in_user_role,
                communityDetails.is_community_join_requested
              )}
              type={communityDetails.type === 2 ? 'private' : 'public'}
            />
            <ShareButton url={communityDetails.share_url} />
          </div>
        </div>
        <div>
          <span className="flex items-center gap-x-2 px-6 py-2">
            <p className="text-title-1-bold">{communityDetails.name}</p>
            <p className="text-body-1-med text-tertiary">@{communityDetails.handle}</p>
            {communityDetails.type === 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center rounded-full bg-tertiary-200 p-1 px-1.5">
                      <LockIcon className="h-4 w-4 stroke-tertiary" />
                      <p className="text-cap-1-demi text-tertiary">Private</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="w-64 bg-monochrome-black">
                    <p className="text-center text-cap-1-med text-monochrome-white">
                      This community is private. Only people approved by it's moderators can see and participate in this
                      community.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {communityDetails.brand && (
              <BrandCommunityTag
                brandSlug={communityDetails.brand.brand_slug}
                brandLogo={communityDetails.brand?.logo}
                brandName={communityDetails.brand?.name}
              />
            )}
          </span>
        </div>

        {communityDetails.type === 2 && !communityDetails.logged_in_user_role ? (
          <div
            className="mt-4 flex w-full items-center justify-center overflow-hidden"
            style={{ height: 'calc(100% - 285px)', backgroundColor: '#F9F9F9' }}>
            <div className="flex flex-col items-center justify-center">
              <Image src={icLock} alt="share" className="h-16 w-16" />
              <p className="text-title-2-bold" style={{ fontWeight: 600 }}>
                This community is private
              </p>
              <p className="text-center text-body-1-med">
                Join this community to see and interact
                <br /> with their posts
              </p>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 overflow-hidden px-6" style={{ height: 'calc(100% - 56px)' }}>
            <div className="snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth">
              {communityDetails.description && (
                <ReadMore.dynamic text={communityDetails.description} maxLines={2} className="mb-2" />
              )}
              <Stats communityDetails={communityDetails} />
              <CommunityDetailsTabs communityDetails={communityDetails} />
            </div>

            <div className="snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth">
              <Categories communityDetails={communityDetails} />
              <Links communityDetails={communityDetails} />
              <Guidelines communityDetails={communityDetails} />
              <Leaders communityDetails={communityDetails} />
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </>
  )
}

function CommunityDetailsTabs({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  return (
    <Tabs defaultValue="Loops" style={{ height: 'calc(100% - 114px)' }}>
      <TabsList className="flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Groups</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-3-bold">Members</p>
        </TabsTrigger>
      </TabsList>
      <hr className="border-t border-tertiary-200" />
      <TabsContent value="Loops" className="mr-2 h-full py-4">
        <CommunityLoopTab slug={communityDetails.slug} />
      </TabsContent>
      <TabsContent value="Members">
        <Members communityDetails={communityDetails} />
      </TabsContent>
    </Tabs>
  )
}

function Categories({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  if (communityDetails.categories && communityDetails.categories?.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Categories</p>
        <div>
          {communityDetails?.categories?.map((cat, index) => {
            return (
              <p key={index} className="my-1 mr-1 inline-block rounded-full bg-tertiary-200 p-2 px-4 text-body-1-med">
                <span className="line-clamp-1 break-all">{cat.title}</span>
              </p>
            )
          })}
        </div>
      </div>
    )
}

function Links({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  const links = communityDetails?.social_links
  if (links?.insta?.id ?? links?.linkedin?.id ?? links?.twitter?.id ?? links?.social_web_url)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Links</p>
        <div className="flex">
          {links?.insta?.id && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links?.insta?.url + links.insta.id)} target="_blank">
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
              <Link href={checkAndAppendHttps(links?.social_web_url)} target="_blank">
                <div className="flex">
                  <Image src={icLink} alt="web-site" />
                  <p className="text-body-1-med">&nbsp;{links?.social_web_url}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
}

function Guidelines({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  if (communityDetails.guidelines.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Guidelines</p>
        <>
          <Accordion type="single" collapsible>
            {communityDetails?.guidelines.map((guideline: any, index: any) => {
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

function Leaders({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  const leader = communityDetails?.leader
  const moderators = communityDetails?.moderators

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

function Members({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  const { data, isLoading } = getCommunityMembers(communityDetails.slug)
  const members = data?.members

  if (isLoading)
    return (
      <>
        {Array.from({ length: 2 }).map((_, index) => (
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
      <div className="py-2">
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

function Stats({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  return (
    <div className="flex items-center">
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold">{communityDetails?.no_of_members}</p>
        <p className="text-body-1-med text-tertiary">
          &nbsp;{communityDetails?.no_of_members === 1 ? 'Member' : 'Members'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold">{communityDetails?.no_of_loops}</p>
        <p className="text-body-1-med text-tertiary">
          &nbsp;{communityDetails?.no_of_loops === 1 ? 'Group' : 'Groups'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold">{communityDetails?.no_of_videos}</p>
        <p className="text-body-1-med text-tertiary">
          &nbsp;{communityDetails?.no_of_videos === 1 ? 'Video' : 'Videos'}
        </p>
      </span>
    </div>
  )
}
