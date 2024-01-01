'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import { useEffect, useRef } from 'react'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from './top-bar'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useInView } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import Link from 'next/link'
import { checkAndAppendHttps } from '@lib/utils'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { DownloadDialog } from '@components/common/download-dialog'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import LoopTab from '@components/common/community-loop-tab'
import { ListItem } from '@components/common/list-item'

interface Props {
  communityDetails: CommunityDetailsType
}

let communityDetailsModule: CommunityDetailsType

// TODO: Separate this component.
export function RootDetails({ communityDetails }: Props) {
  communityDetailsModule = communityDetails
  const addCommunity = useRecentCommunitiesStore((state) => state.addCommunity)
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
    })
  }, [])

  return (
    <>
      <TopBar
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.info.name}
        communityProfileImage={communityDetails.info.profile_image}
        communtiyHandle={communityDetails.info.handle}
      />
      <main className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-6">
        <div ref={detailsDivRef} className="pt-6">
          <CustomAvatar
            isAvatar={false}
            imageUrl={communityDetails.info.profile_image}
            fallbackString={communityDetails.info.name}
            className="h-20 w-20"
          />
          <span className="flex items-center gap-x-2 py-2">
            <p className="text-title-1-bold">{communityDetails.info.name}</p>
            <p className="text-body-1-med text-secondary">@{communityDetails.info.handle}</p>
          </span>
          <Stats communityDetails={communityDetails} />
          <p className="mb-4 mt-2 line-clamp-2 w-1/2 break-all text-body-1-med">{communityDetails.info.description}</p>
          <span className="flex items-center gap-x-2">
            <DownloadDialog
              title="Get the Genuin app"
              subtitle={
                <>
                  Get the app to join the <br />
                  <span className="font-bold">{communityDetails.info.name}</span> community.
                </>
              }
              asChild>
              <Button size="custom">
                <p className="px-4 py-2 text-body-1-demi">Join Community</p>
              </Button>
            </DownloadDialog>
            <Button
              variant="outline"
              size="custom"
              className="border border-primary p-0.5"
              onClick={async () =>
                await shareFn({
                  shareLink: window.location.href,
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }>
              <Image src={icShare} alt="share" className="h-7 w-7" />
            </Button>
          </span>
        </div>
        {/* // TODO: have to add is_private community */}
        {/* <div
          className="mt-4 flex w-full items-center justify-center overflow-hidden"
          style={{ height: 'calc(100% - 56px)', backgroundColor: '#F9F9F9' }}>
          <div className="flex flex-col items-center justify-center">
            <Image src={lockIcon} alt="share" className="h-16 w-16" />
            <p className="text-title-lg" style={{ fontWeight: 600 }}>
              This community is private
            </p>
            <p className="text-center text-body-sm" style={{ fontWeight: 500 }}>
              Join this community to see and interact
              <br /> with their posts
            </p>
          </div>
        </div> */}
        <div className="grid w-full grid-cols-2 gap-4 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
          <div className="snap-y snap-proximity overflow-auto scroll-smooth">
            <CommunityDetailsTabs />
          </div>

          {/* // TODO: Improve this code. Links should not conditioned like this. */}
          <div className="snap-y snap-proximity overflow-auto scroll-smooth">
            {communityDetails.info.categories.length !== 0 && <Categories />}
            {communityDetails.info.links?.instagram_url &&
              communityDetails.info.links?.linkedin_url &&
              communityDetails.info.links?.twitter_url &&
              communityDetails.info.links?.social_web_url && <Links />}
            {communityDetails.guidelines && <Guidelines />}
            {communityDetails.leaders.length !== 0 && <Leaders />}
          </div>
        </div>
      </main>
      <Toaster />
    </>
  )
}

function CommunityDetailsTabs() {
  return (
    <Tabs defaultValue="Loops">
      <TabsList className="sticky flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-3-bold">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-3-bold">Members</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Loops" className="mr-2">
        <LoopTab communityHandle={communityDetailsModule.info.handle} />
      </TabsContent>
      <TabsContent value="Members">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function Categories() {
  return (
    <div>
      <p className="my-2 mt-4 text-title-3-bold">Categories</p>
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
  return (
    <div>
      <p className="my-2 mt-4 text-title-md">Links</p>
      <div className="flex">
        {links?.instagram_url && (
          <div className="mx-1 rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.instagram_url)} target="_blank">
              <Image src={icInstagram} alt="instagram" />
            </Link>
          </div>
        )}
        {links?.linkedin_url && (
          <div className="mx-1 rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.linkedin_url)} target="_blank">
              <Image src={icLinkedIn} alt="linkedin" />
            </Link>
          </div>
        )}
        {links?.twitter_url && (
          <div className="mx-1 rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.twitter_url)} target="_blank">
              <Image src={icTwitter} alt="twitter" />
            </Link>
          </div>
        )}
        {links?.social_web_url && (
          <div className="mx-1 rounded-md bg-monochrome-9 p-1">
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
  return (
    <div>
      <p className="my-2 mt-4 text-title-3-bold">Guidelines</p>
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
  return (
    <div>
      <p className="my-2 mt-4 text-title-md">Leader</p>
      {communityDetailsModule?.leaders.map((moderator, index) => {
        return (
          <Link key={index} href={{ pathname: PATH_NAME.profile(moderator.nickname) }}>
            <ListItem
              title={moderator.name ?? ''}
              subtitle={'@' + moderator.nickname}
              description={moderator.description}
              image={moderator.profile_image}
            />
          </Link>
        )
      })}
    </div>
  )
}

function Members() {
  return (
    <div className="my-2">
      {communityDetailsModule?.members.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No members available</div>
      )}
      {communityDetailsModule?.members.map((member, index) => {
        return (
          <Link key={index} href={{ pathname: PATH_NAME.profile(member.nickname) }}>
            <ListItem
              title={member.name}
              subtitle={'@' + member.nickname}
              description={member.description ?? ''}
              image={member.profile_image}
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
        <p className="text-body-1-med text-secondary" style={{ fontWeight: 500 }}>
          &nbsp;{communityDetails?.info.count.member === 1 ? 'Member' : 'Members'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold text-monochrome-black">{communityDetails?.info.count.loop}</p>
        <p className="text-body-1-med text-secondary" style={{ fontWeight: 500 }}>
          &nbsp;{communityDetails?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </p>
      </span>
      <span className="flex items-center pr-4">
        <p className="text-title-3-bold text-monochrome-black">{communityDetails?.info.count.video}</p>
        <p className="text-body-1-med text-secondary" style={{ fontWeight: 500 }}>
          &nbsp;{communityDetails?.info.count.video === 1 ? 'Video' : 'Videos'}
        </p>
      </span>
    </div>
  )
}
