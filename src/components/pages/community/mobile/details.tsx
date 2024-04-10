import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { checkAndAppendHttps, generateDeepLink, getCurrentShareUrl, openGeneratedLink, openModal } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icLock from '@icons/icLock.svg'
import Link from 'next/link'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import icMore from '@icons/icMoreBlue.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from '../../../layouts/mobile/top-bar'
import { CommunityLoopTab } from './community-loop-tab'
import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { TopStickyBar } from '../../../../app/(site)/@desktop/community/[slug]/top-bar'
import { DownloadDialog } from '@components/common/download-dialog'
import { joinCommunity } from '@lib/api/video'
import { ShareIcon } from '@icons/share-icon'
import { useSearchParams } from 'next/navigation'

let communityDetailsModule: CommunityDetailsType

interface Props {
  communityDetails: CommunityDetailsType
}

export function ProfileDetails({ communityDetails }: Props) {
  communityDetailsModule = communityDetails
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isEmbed, parentUrl } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))
  const [isCommunityJoined, setIsCommunityJoined] = useState(false)
  const user = useGenuinOptions().user
  const searchParams = Object.fromEntries(useSearchParams())

  return (
    <>
      <TopBar />
      <TopStickyBar.mobile
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.info.name}
        communityProfileImage={communityDetails.info.profile_image}
        communtiyHandle={communityDetails.info.handle}
      />
      <div
        className="hide-scrollbar absolute inset-0 mt-navbar w-full overflow-auto"
        style={{ height: 'calc(100% - 74px)' }}>
        <div
          className="aspect-w-5 aspect-h-1 relative h-20 bg-tertiary-200"
          style={{
            height: 'calc(100vw/5)',
          }}>
          <CustomAvatar
            imageUrl={communityDetailsModule?.info.profile_image}
            fallbackString={communityDetailsModule?.info.name}
            isAvatar={false}
            className="absolute -bottom-14 left-4 h-20 w-20 border-2 border-monochrome-white bg-red-50"
          />
        </div>
        <div className="px-4 py-2 pt-4">
          <div className="flex justify-end">
            <div className="flex items-center gap-x-2">
              {isEmbed ? (
                <Button
                  size="sm"
                  className={`${isCommunityJoined && 'border border-primary '}`}
                  variant={isCommunityJoined ? 'outline' : 'default'}
                  onClick={
                    user
                      ? async () => {
                          !isCommunityJoined
                            ? await joinCommunity(
                                false,
                                [communityDetails.info.id],
                                [
                                  {
                                    user_id: user?.id,
                                  },
                                ]
                              ).then((res) => {
                                if (res.code === 200) {
                                  setIsCommunityJoined((prev: any) => !prev)
                                }
                              })
                            : setIsCommunityJoined((prev: any) => !prev)
                        }
                      : () => {
                          openModal({
                            title: 'Get the Genuin app',
                            subtitle: (
                              <>
                                Get the app to join the <br />
                                <span className="font-bold">@{communityDetails.info.handle}</span> community.
                              </>
                            ),
                          })
                        }
                  }>
                  <p className={`mx-2 text-body-1-bold text-monochrome-white ${isCommunityJoined && 'text-primary'}`}>
                    {isCommunityJoined ? 'Joined' : 'Join Community'}
                  </p>
                </Button>
              ) : (
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
                      utmCampaign: 'share',
                      utmMedium: 'web',
                      utmSource: window.location.hostname,
                      searchParams,
                    })
                      .then((generatedLink) => {
                        openGeneratedLink(generatedLink)
                      })
                      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
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
                    shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
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
          <div ref={detailsDivRef}>
            <p className="my-1 mt-2 line-clamp-1 break-all text-title-3-bold ">{communityDetailsModule?.info.name}</p>
            <p className="my-1 line-clamp-2 break-all text-body-1-demi ">{communityDetailsModule?.info.description}</p>
          </div>
          <Stats />
        </div>
        {communityDetails.info.private ? (
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
        <span className="text-title-3-bold ">{communityDetailsModule?.info.count.member}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.info.count.member === 1 ? 'Member' : 'Members'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-3-bold ">{communityDetailsModule?.info.count.loop}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </span>
      </span>
      <span className="pr-4">
        <span className="text-title-3-bold ">{communityDetailsModule?.info.count.video}</span>
        <span className="text-cap-1-demi text-tertiary">
          &nbsp;{communityDetailsModule?.info.count.video === 1 ? 'Video' : 'Videos'}
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
          <p className="text-title-3-bold">Loops</p>
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
        <CommunityLoopTab communitySlug={communityDetailsModule.info.slug} />
      </TabsContent>
      <TabsContent value="About" className="mx-4">
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

function Categories() {
  if (communityDetailsModule.info.categories.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold">Categories</p>
        {communityDetailsModule?.info.categories.length === 0 && (
          <div className="flex items-center justify-center text-title-3-bold ">No categories available</div>
        )}
        <div>
          {communityDetailsModule?.info.categories.map((cat, index) => {
            return (
              <p key={index} className="mx-1 my-1 inline-block rounded-full bg-tertiary-200 p-2 px-4 text-body-1-demi">
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
      <div>
        <p className="my-2 text-title-3-bold">Links</p>
        {!links?.instagram_url && !links?.linkedin_url && !links?.twitter_url && !links?.social_web_url && (
          <div className="flex items-center justify-center text-title-3-bold ">No links available</div>
        )}
        <div className="flex">
          {links?.instagram_url && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links.instagram_url)} target="_blank">
                <Image src={icInstagram} alt="instagram" />
              </Link>
            </div>
          )}
          {links?.linkedin_url && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links.linkedin_url)} target="_blank">
                <Image src={icLinkedIn} alt="linkedin" />
              </Link>
            </div>
          )}
          {links?.twitter_url && (
            <div className="mx-1 flex items-center rounded-md bg-tertiary-200 p-1">
              <Link href={checkAndAppendHttps(links.twitter_url)} target="_blank">
                <Image src={icTwitter} alt="twitter" />
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
  if (communityDetailsModule.leaders.length !== 0)
    return (
      <div>
        <p className="my-2 text-title-3-bold ">Leader</p>
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
    <div className="flex items-center gap-x-1 rounded-lg p-2">
      <CustomAvatar
        className="h-12 w-12 bg-red-40"
        imageUrl={image ?? ''}
        fallbackString={title ?? ''}
        isAvatar={isAvatar}
      />
      <div className="mx-2">
        <p className="line-clamp-1 text-body-1-bold ">{subtitle}</p>
        {subtitle && <p className="line-clamp-1 text-body-1-demi ">{title}</p>}
        {description && <p className="line-clamp-1 text-cap-1-demi text-tertiary">{description}</p>}
      </div>
    </div>
  )
}

function Members() {
  return (
    <div>
      {/* <p className="my-2 text-title-3-bold">Members</p> */}
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
