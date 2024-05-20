'use client'
import type { CommunityDetailsType, MembersSchemaType } from '@lib/schemas/community'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopStickyBar } from './top-bar'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import { useInView } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import Link from 'next/link'
import { checkAndAppendHttps, getCurrentShareUrl, openModal } from '@lib/utils'
import icLink from '@icons/icLinkBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CommunityLoopTab } from './community-loop-tab'
import { ListItem } from '@components/common/list-item'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { joinCommunity, leaveCommunity } from '@lib/api/video'
import { ShareIcon } from '@icons/share-icon'
import { getCommunityDetails, getCommunityMembers } from '@lib/api/community'
import Loading from './loading'
import { Shimmer } from '@components/ui/shimmer'
import { LockIcon } from '@icons/LockIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { BrandCommunityTag } from '@components/common/brand-community-tag'
import { InstagramIcon } from '@icons/instagram-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'

let communityDetailsModule: CommunityDetailsType

export function CommunityDetails({ slug }: { slug: string }) {
  const { data, isLoading } = getCommunityDetails(slug)

  if (isLoading) return <Loading />

  if (data) return <RootDetails communityDetails={data} />
}

// TODO: Separate this component.
export function RootDetails({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  communityDetailsModule = communityDetails
  const addCommunity = useLocalStorage((state) => state.addCommunity)
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (detailsDivRef.current) {
      setDimensions({
        width: detailsDivRef.current.offsetWidth,
        height: detailsDivRef.current.offsetHeight,
      })
    }
  }, [detailsDivRef.current])

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
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.name ?? ''}
        communityProfileImage={communityDetails.dp ?? ''}
        communityHandle={communityDetails.handle}
        role={communityDetails.logged_in_user_role}
        communityId={communityDetails.community_id}
        shareUrl={communityDetails.share_url}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto">
        <div>
          <div
            className="-px-6 aspect-w-5 aspect-h-1 relative rounded-lg bg-tertiary-200"
            style={{
              height: `calc(${dimensions.width}px / 5)`,
            }}>
            {communityDetails?.banner && (
              <img src={communityDetails?.banner} alt="banner" className="h-full w-full object-cover" />
            )}
            <CustomAvatar
              isAvatar={false}
              imageUrl={communityDetails.dp ?? ''}
              fallbackString={communityDetails.name ?? ''}
              className="absolute -bottom-14 left-6 h-20 w-20 border-2 border-monochrome-white text-new-h2 font-medium"
            />
          </div>
          <div ref={detailsDivRef} className="my-3 flex items-center justify-end gap-x-2">
            {communityDetails.is_community_join_requested ? (
              <Button size="custom" className="border border-primary" variant={'outline'}>
                <p className={`px-4 py-1.5 text-body-1-demi text-monochrome-white text-primary`}>Requested</p>
              </Button>
            ) : (
              <JoinButton
                handle={communityDetails.handle}
                id={communityDetails.community_id}
                userRole={communityDetails.logged_in_user_role}
              />
            )}

            <Button
              variant="outline"
              size="custom"
              className="border border-primary p-0.5 hover:border-primary-600"
              onClick={async () => {
                await shareFn({
                  shareLink: getCurrentShareUrl({ url: communityDetails.share_url }),
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }}>
              <ShareIcon className="h-6 w-6 fill-primary hover:fill-primary-600" />
            </Button>
            {/* <Button variant="outline" size="custom" className="border border-primary p-1">
              <Image src={icMore} alt="share" className="h-6 w-6" />
            </Button> */}
          </div>
        </div>
        <div>
          <span className="flex items-center gap-x-2 px-6 py-2">
            <p className="text-title-1-bold">{communityDetails.name}</p>
            <p className="text-body-1-med text-tertiary">@{communityDetails.handle}</p>
            {communityDetailsModule.type === 2 && (
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
            {communityDetailsModule.brand && (
              <BrandCommunityTag
                brandSlug={communityDetailsModule.brand.brand_slug}
                brandLogo={communityDetailsModule.brand?.logo}
                brandName={communityDetailsModule.brand?.name}
              />
            )}
          </span>
        </div>

        {communityDetailsModule.type === 2 && !communityDetailsModule.logged_in_user_role ? (
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
                <p className="mb-2 line-clamp-2 break-all text-body-1-med">{communityDetails.description}</p>
              )}
              <Stats communityDetails={communityDetails} />
              <CommunityDetailsTabs />
            </div>

            <div className="snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth">
              <Categories />
              <Links />
              <Guidelines />
              <Leaders />
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </>
  )
}

function CommunityDetailsTabs() {
  return (
    <Tabs defaultValue="Loops" style={{ height: 'calc(100% - 114px)' }}>
      <TabsList className="flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-3-bold">Members</p>
        </TabsTrigger>
      </TabsList>
      <hr className="border-t border-tertiary-200" />
      <TabsContent value="Loops" className="mr-2 h-full py-4">
        <CommunityLoopTab
          community={{
            handle: communityDetailsModule.handle,
            id: communityDetailsModule.community_id,
            slug: communityDetailsModule.slug,
            name: communityDetailsModule.name,
            profileImage: communityDetailsModule.dp,
            shareUrl: communityDetailsModule.share_url,
          }}
        />
      </TabsContent>
      <TabsContent value="Members">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function Categories() {
  if (communityDetailsModule.categories?.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Categories</p>
        <div>
          {communityDetailsModule?.categories?.map((cat, index) => {
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

function Links() {
  const links = communityDetailsModule?.social_links
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

function Leaders() {
  const leader = communityDetailsModule?.leader

  if (!leader || leader.nickname.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <p className="my-2 text-title-3-bold">Leader</p>
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
          brand={leader.brand ?? null}
        />
      </Link>
    </div>
  )
}

function Members() {
  const { data, isLoading } = getCommunityMembers(communityDetailsModule.slug)
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
        <p className="text-body-1-med text-tertiary">&nbsp;{communityDetails?.no_of_loops === 1 ? 'Loop' : 'Loops'}</p>
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

export function JoinButton({
  userRole,
  handle,
  id,
}: {
  userRole?: 'LEADER' | 'MEMBER' | null
  handle: string
  id: string
}) {
  const [role, setRole] = useState(userRole)
  const user = useGenuinOptions().user
  async function toggleCommunityJoinState() {
    role !== 'MEMBER'
      ? await joinCommunity(
          false,
          [id],
          [
            {
              user_id: user?.id,
            },
          ]
        ).then((res) => {
          if (res.code === 200) {
            setRole('MEMBER')
          }
        })
      : await leaveCommunity(id).then((res) => {
          if (res.code === 200) {
            setRole(null)
          }
        })
  }

  if (userRole === 'LEADER') return

  const isCommunityJoined = role === 'MEMBER'
  return (
    <Button
      size="custom"
      className={`${isCommunityJoined && 'rounded border border-primary '}`}
      variant={isCommunityJoined ? 'outline' : 'default'}
      onClick={
        user
          ? async () => {
              await toggleCommunityJoinState()
            }
          : () => {
              openModal({
                title: 'Get the Genuin app',
                subtitle: (
                  <>
                    Get the app to join the <br />
                    <span className="font-bold">@{handle}</span> community.
                  </>
                ),
              })
            }
      }>
      <p
        className={`whitespace-nowrap px-4 py-1.5 text-body-1-demi  ${
          isCommunityJoined ? 'text-primary' : 'text-monochrome-white'
        }`}>
        {isCommunityJoined ? 'Joined' : 'Join Community'}
      </p>
    </Button>
  )
}
