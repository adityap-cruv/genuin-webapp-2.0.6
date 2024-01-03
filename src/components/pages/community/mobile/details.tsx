import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Button } from '@components/ui/button'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { checkAndAppendHttps, generateDeepLink, openGeneratedLink } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import Link from 'next/link'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from '../../../layouts/mobile/top-bar'
import { CommunityLoopTab } from '@components/common/community-loop-tab'

let communityDetailsModule: CommunityDetailsType

interface Props {
  communityDetails: CommunityDetailsType
}

export function ProfileDetails({ communityDetails }: Props) {
  communityDetailsModule = communityDetails
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

  return (
    <>
      <TopBar />
      <div className="h-full">
        <div className="px-4 py-2 pt-4">
          <div className="flex justify-between">
            <CustomAvatar
              imageUrl={communityDetailsModule?.info.profile_image}
              fallbackString={communityDetailsModule?.info.name}
              isAvatar={false}
              className="h-20 w-20 bg-red-50"
            />
            <div className="my-2 flex items-center gap-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  generateDeepLink({
                    action: 'join',
                    contentType: 'community',
                    description: `Find your people. Find what you love. | Join ${communityDetailsModule?.info.name} to talk about it`,
                    title: `join ${communityDetailsModule?.info.name}`,
                    previewImage: null,
                    fromUserName: null,
                    pathName: window.location.pathname,
                    sourceId: communityDetailsModule.info.handle,
                    utmCampaign: 'share',
                    utmMedium: 'web',
                    utmSource: window.location.hostname,
                  })
                    .then((generatedLink) => {
                      openGeneratedLink(generatedLink)
                    })
                    .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                }}>
                <p className="mx-2 text-title-sm text-monochrome-white">Join Community</p>
              </Button>
              <Button
                variant="outline"
                outlineColor="genuin-blue"
                size="sm"
                className="p-1"
                onClick={async () =>
                  await shareFn({
                    shareLink: window.location.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <Image src={icShare} alt="share" />
              </Button>
            </div>
          </div>
          <p className="my-1 line-clamp-1 break-all text-title-md">{communityDetailsModule?.info.name}</p>
          <p className="my-1 line-clamp-2 break-all text-body-sm">{communityDetailsModule?.info.description}</p>
          <Stats />
        </div>
        <ProfileTabs />
        {/* //TODO have to add is_private community */}
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
      </div>
    </>
  )
}

function Stats() {
  return (
    <div className="flex items-center">
      <span className="pr-4">
        <span className="text-title-md text-monochrome-black">{communityDetailsModule?.info.count.member}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetailsModule?.info.count.member === 1 ? 'Member' : 'Members'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-md text-monochrome-black">{communityDetailsModule?.info.count.loop}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetailsModule?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-md text-monochrome-black">{communityDetailsModule?.info.count.video}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetailsModule?.info.count.video === 1 ? 'Video' : 'Videos'}
        </span>
      </span>
    </div>
  )
}

function ProfileTabs() {
  return (
    <Tabs defaultValue="Loops" className="">
      <TabsList className="sticky flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-md">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-md">Members</p>
        </TabsTrigger>
        <TabsTrigger value="About">
          <p className="text-title-md">About</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Loops" className="mx-4">
        <CommunityLoopTab communitySlug={communityDetailsModule.info.slug} />
      </TabsContent>
      <TabsContent value="About" className="mx-4">
        {communityDetailsModule.info.categories.length !== 0 && <Categories />}
        {communityDetailsModule.info.links?.instagram_url &&
          communityDetailsModule.info.links?.linkedin_url &&
          communityDetailsModule.info.links?.twitter_url &&
          communityDetailsModule.info.links?.social_web_url && <Links />}
        {communityDetailsModule.leaders.length !== 0 && <Leaders />}
      </TabsContent>
      <TabsContent value="Members" className="m-4">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function Categories() {
  return (
    <div>
      <p className="my-2 text-title-md">Categories</p>
      {communityDetailsModule?.info.categories.length === 0 && (
        <div className="flex items-center justify-center text-title-md text-secondary">No categories available</div>
      )}
      <div>
        {communityDetailsModule?.info.categories.map((cat, index) => {
          return (
            <p key={index} className="mx-1 my-1 inline-block rounded-full bg-monochrome-9 p-2 px-4 text-body-sm">
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
      <p className="my-2 text-title-md">Links</p>
      {!links?.instagram_url && !links?.linkedin_url && !links?.twitter_url && !links?.social_web_url && (
        <div className="flex items-center justify-center text-title-md text-secondary">No links available</div>
      )}
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
                <p className="text-body-sm">&nbsp;{links.social_web_url}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Leaders() {
  return (
    <div>
      <p className="my-2 text-title-md">Leader</p>
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

function ListItem({
  title,
  subtitle,
  description,
  image,
  isAvatar,
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
  isAvatar: boolean
}) {
  return (
    <div className="flex items-center gap-x-1 rounded-lg p-2 hover:bg-monochrome-10">
      <CustomAvatar
        className="h-12 w-12 bg-red-40"
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={isAvatar}
      />
      <div className="mx-2">
        <p className="line-clamp-1 text-title-sm">{subtitle}</p>
        {subtitle && <p className="line-clamp-1 text-title-sm">{title}</p>}
        {description && <p className="line-clamp-1 text-cap-lg text-monochrome">{description}</p>}
      </div>
    </div>
  )
}

function Members() {
  return (
    <div>
      {/* <p className="my-2 text-title-md">Members</p> */}
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
              isAvatar={member.is_avatar}
            />
          </Link>
        )
      })}
    </div>
  )
}
