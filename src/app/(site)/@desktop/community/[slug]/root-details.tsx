'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopStickyBar } from './top-bar'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icMore from '@icons/icMoreBlue.svg'
import icLock from '@icons/icLock.svg'
import { useInView } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import Link from 'next/link'
import { checkAndAppendHttps, getCurrentShareUrl, openModal } from '@lib/utils'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CommunityLoopTab } from './community-loop-tab'
import { ListItem } from '@components/common/list-item'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { joinCommunity } from '@lib/api/video'

interface Props {
  communityDetails: CommunityDetailsType
}

let communityDetailsModule: CommunityDetailsType

// TODO: Separate this component.
export function RootDetails({ communityDetails }: Props) {
  communityDetailsModule = communityDetails
  const addCommunity = useLocalStorage((state) => state.addCommunity)
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isEmbed, parentUrl } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))
  const [isCommunityJoined, setIsCommunityJoined] = useState(false)
  const user = useGenuinOptions().user

  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
      slug: communityDetails.info.slug,
    })
  }, [])

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.info.name}
        communityProfileImage={communityDetails.info.profile_image}
        communtiyHandle={communityDetails.info.handle}
        communityId={communityDetails.info.id}
        isCommunityJoined={isCommunityJoined}
        setIsCommunityJoined={setIsCommunityJoined}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto">
        <div>
          <div className="-px-6 relative h-56 w-full rounded-lg bg-monochrome-9">
            <CustomAvatar
              isAvatar={false}
              imageUrl={communityDetails.info.profile_image}
              fallbackString={communityDetails.info.name}
              className="absolute -bottom-14 left-6 h-20 w-20 border-2 border-monochrome-white text-new-h2 font-medium"
            />
          </div>
          <div ref={detailsDivRef} className="my-3 flex items-center justify-end gap-x-2">
            <Button
              size="custom"
              className={`${isCommunityJoined && 'border border-primary '}`}
              variant={isCommunityJoined ? 'outline' : 'default'}
              onClick={
                user
                  ? async () => {
                      !isCommunityJoined &&
                        (await joinCommunity(
                          false,
                          [communityDetails.info.id],
                          [
                            {
                              user_id: user?.id,
                            },
                          ]
                        ))
                      setIsCommunityJoined((prev) => !prev)
                    }
                  : () => {
                      openModal({
                        title: 'Get the Genuin app',
                        subtitle: (
                          <>
                            Get the app to join the <br />
                            <span className="font-bold">{communityDetails.info.name}</span> community.
                          </>
                        ),
                      })
                    }
              }>
              <p className={`px-4 py-1.5 text-body-1-demi ${isCommunityJoined && 'text-primary'}`}>
                {isCommunityJoined ? 'Joined' : 'Join Community'}
              </p>
            </Button>
            <Button
              variant="outline"
              size="custom"
              className="border border-primary p-0.5"
              onClick={async () =>
                await shareFn({
                  shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }>
              <Image src={icShare} alt="share" className="h-7 w-7" />
            </Button>
            {/* <Button variant="outline" size="custom" className="border border-primary p-1">
              <Image src={icMore} alt="share" className="h-6 w-6" />
            </Button> */}
          </div>
        </div>
        <div>
          <span className="flex items-center gap-x-2 px-6 py-2">
            <p className="text-title-1-bold">{communityDetails.info.name}</p>
            <p className="text-body-1-med text-secondary">@{communityDetails.info.handle}</p>
          </span>
        </div>

        {communityDetails.info.private ? (
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
              {communityDetails.info.description && (
                <p className="mb-2 line-clamp-2 break-all text-body-1-med">{communityDetails.info.description}</p>
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
      <hr className="border-t border-monochrome-9" />
      <TabsContent value="Loops" className="mr-2 h-full py-4">
        <CommunityLoopTab communitySlug={communityDetailsModule.info.slug} />
      </TabsContent>
      <TabsContent value="Members">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function Categories() {
  if (communityDetailsModule.info.categories.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Categories</p>
        <div>
          {communityDetailsModule?.info.categories.map((cat, index) => {
            return (
              <p key={index} className="my-1 mr-1 inline-block rounded-full bg-monochrome-9 p-2 px-4 text-body-1-med">
                <span className="line-clamp-1 break-all">{cat}</span>
              </p>
            )
          })}
        </div>
      </div>
    )
}

function Links() {
  const links = communityDetailsModule?.info.links
  if (links?.instagram_url ?? links?.linkedin_url ?? links?.twitter_url ?? links?.social_web_url)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Links</p>
        <div className="flex">
          {links?.instagram_url && (
            <div className="mx-1 flex items-center rounded-md bg-monochrome-9 p-1">
              <Link href={checkAndAppendHttps(links.instagram_url)} target="_blank">
                <Image src={icInstagram} alt="instagram" />
              </Link>
            </div>
          )}
          {links?.linkedin_url && (
            <div className="mx-1 flex items-center rounded-md bg-monochrome-9 p-1">
              <Link href={checkAndAppendHttps(links.linkedin_url)} target="_blank">
                <Image src={icLinkedIn} alt="linkedin" />
              </Link>
            </div>
          )}
          {links?.twitter_url && (
            <div className="mx-1 flex items-center rounded-md bg-monochrome-9 p-1">
              <Link href={checkAndAppendHttps(links.twitter_url)} target="_blank">
                <Image src={icTwitter} alt="twitter" />
              </Link>
            </div>
          )}
          {links?.social_web_url && (
            <div className="mx-1 flex items-center rounded-md bg-monochrome-9 p-1">
              <Link href={checkAndAppendHttps(links.social_web_url)} target="_blank">
                <div className="flex">
                  <Image src={icLink} alt="web-site" />
                  <p className="text-body-1-med">&nbsp;{links.social_web_url}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
}

function Guidelines() {
  if (communityDetailsModule.guidelines)
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
                      <p className="line-clamp-2 text-left  text-monochrome">{guideline.description}</p>
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
  if (communityDetailsModule.leaders.length !== 0)
    return (
      <div className="mb-4">
        <p className="my-2 text-title-3-bold">Leader</p>
        {communityDetailsModule?.leaders.map((moderator, index) => {
          return (
            <Link key={index} href={{ pathname: PATH_NAME.profile(moderator.nickname) }}>
              <ListItem
                title={moderator.name ?? ''}
                subtitle={'@' + moderator.nickname}
                description={moderator.description}
                image={moderator.profile_image}
                isAvatar={moderator.is_avatar}
              />
            </Link>
          )
        })}
      </div>
    )
}

function Members() {
  return (
    <div className="py-2">
      {communityDetailsModule?.leaders.map((moderator, index) => {
        return (
          <Link key={index} href={{ pathname: PATH_NAME.profile(moderator.nickname) }}>
            <ListItem
              title={moderator.name ?? ''}
              subtitle={'@' + moderator.nickname}
              description={moderator.description}
              image={moderator.profile_image}
              isAvatar={moderator.is_avatar}
            />
          </Link>
        )
      })}
      {communityDetailsModule?.members.map((member, index) => {
        return (
          <Link key={index} href={{ pathname: PATH_NAME.profile(member.nickname) }}>
            <ListItem
              title={member.name}
              subtitle={'@' + member.nickname}
              description={member.description ?? ''}
              image={member.profile_image}
              isAvatar={member.is_avatar}
            />
          </Link>
        )
      })}
    </div>
  )
}

function Stats({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  return (
    <div className="flex items-center">
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold text-monochrome-black">{communityDetails?.info.count.member}</p>
        <p className="text-body-1-med text-secondary">
          &nbsp;{communityDetails?.info.count.member === 1 ? 'Member' : 'Members'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold text-monochrome-black">{communityDetails?.info.count.loop}</p>
        <p className="text-body-1-med text-secondary">
          &nbsp;{communityDetails?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold text-monochrome-black">{communityDetails?.info.count.video}</p>
        <p className="text-body-1-med text-secondary">
          &nbsp;{communityDetails?.info.count.video === 1 ? 'Video' : 'Videos'}
        </p>
      </span>
    </div>
  )
}
