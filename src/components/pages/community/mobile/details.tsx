import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Button } from '@components/ui/button'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { checkAndAppendHttps, getAvatarFallback, isValidHTTPS } from '@lib/utils'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import Link from 'next/link'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { PATH_NAME } from '@lib/utils/constants/path'
import { getCommunityLoops } from '@lib/api/community'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
const DetailsNavbar = dynamic(() =>
  import('@components/pages/community/mobile/nav-bar').then((comp) => comp.NavBar.details)
)

let communityDetailsModule: CommunityDetailsType

interface Props {
  communityDetails: CommunityDetailsType
}

export function ProfileDetails({ communityDetails }: Props) {
  communityDetailsModule = communityDetails

  return (
    <>
      <DetailsNavbar variant="light" communityDetails={communityDetails} />
      <div className="mt-navbar h-body">
        <div className="px-4">
          <div className="flex justify-between">
            <Avatar className="h-20 w-20 bg-red-50">
              <AvatarImage src={communityDetailsModule?.info.profile_image} />
              <AvatarFallback>
                <p className="text-title-xl text-monochrome-white">
                  {getAvatarFallback(communityDetailsModule?.info.name)}
                </p>
              </AvatarFallback>
            </Avatar>
            <div className="my-2 flex items-center gap-x-2">
              <Button variant="default" size="sm">
                <p className="mx-2 text-title-sm text-monochrome-white">Join</p>
              </Button>
              <Button variant="outline" outlineColor="genuin-blue" size="sm" className="p-1">
                <Image src={icShare} alt="share" />
              </Button>
            </div>
          </div>
          <p className="my-2 line-clamp-1 break-all text-title-md">{communityDetailsModule?.info.name}</p>
          <p className="my-2 line-clamp-3 break-all text-body-sm">{communityDetailsModule?.info.description}</p>
          <Stats />
        </div>
        <ProfileTabs />
      </div>
    </>
  )
}

function Stats() {
  return (
    <div className="flex items-center">
      <span className="px-1">
        <span className="text-title-md text-monochrome-black">{communityDetailsModule?.info.count.member}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetailsModule?.info.count.member === 1 ? 'Member' : 'Members'}
        </span>
      </span>
      <span className="px-1">
        <span className="text-title-md text-monochrome-black">{communityDetailsModule?.info.count.loop}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetailsModule?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </span>
      </span>
      <span className="px-1">
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
    <Tabs defaultValue="Loops">
      <TabsList className="sticky z-10 flex max-w-min">
        <TabsTrigger value="Loops">
          <p className="text-title-md">Loops</p>
        </TabsTrigger>
        <TabsTrigger value="About">
          <p className="text-title-md">About</p>
        </TabsTrigger>
        <TabsTrigger value="Members">
          <p className="text-title-md">Members</p>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Loops" className="mx-4">
        <LoopTab />
      </TabsContent>
      <TabsContent value="About" className="mx-4">
        <Categories />
        <Links />
        <Leaders />
      </TabsContent>
      <TabsContent value="Members" className="mx-4">
        <Members />
      </TabsContent>
    </Tabs>
  )
}

function LoopTab() {
  const { isLoading, data: loops, isFetched } = getCommunityLoops(communityDetailsModule.info.handle)
  return (
    <div className="py-4">
      {isLoading && <Loader size="sm" />}
      {isFetched &&
        loops.map((item: any, index: number) => {
          return <LoopItem key={index} loopDetails={item} />
        })}
    </div>
  )
}

function LoopItem({ loopDetails }: { loopDetails: any }) {
  const transformValues: any = {
    1: [50],
    2: [48, 52],
    3: [46, 50, 54],
  }

  const rightValues: any = {
    1: [20],
    2: [24, 16],
    3: [28, 20, 12],
  }

  const opacitValues: any = {
    1: [1],
    2: [1, 0.5],
    3: [1, 0.66, 0.4],
  }

  const videosLength = loopDetails.videos.length
  const renderedImages = loopDetails.videos.map((item: any, index: any) => (
    <img
      key={index}
      style={{
        position: 'absolute',
        top: '50%',
        right: `${rightValues[videosLength][index]}px`,
        transform: `translateY(-${transformValues[videosLength][index]}%)`,
        height: '80%',
        aspectRatio: '9/16',
        borderRadius: '4px',
        zIndex: videosLength - index + 1,
        opacity: `${opacitValues[videosLength][index]}`,
      }}
      // onError={(e) => {
      //   e.target.src = icPreviewImage.src
      // }}
      src={item.thumbnail}
      alt={`frontimage${index}`}
    />
  ))

  function getSubscribersCountString(count: any) {
    let str = ' + '
    if (!count) return
    if (count === 1) {
      str += count + ' subscriber'
    } else {
      str += count + ' subscribers'
    }
    return str
  }

  return (
    <a href={`/l/${loopDetails.share_string}?v=${loopDetails.videos[0].share_string}`}>
      <div
        className="relative mt-5 w-full rounded-lg border"
        style={{ backgroundColor: 'rgba(6, 69, 255, 0.05)', border: '1px solid rgba(6, 69, 255, 0.40)' }}>
        <div style={{ display: 'flex', padding: '3%', width: '70%', alignItems: 'center' }}>
          <Avatar className="h-12 w-12 bg-red-50">
            <AvatarImage src={loopDetails.profile_image} />
            <AvatarFallback>
              <p className="text-title-xl text-monochrome-white">{getAvatarFallback(loopDetails.name)}</p>
            </AvatarFallback>
          </Avatar>
          <p className="ml-2 text-title-sm">{loopDetails.name}</p>
        </div>
        <div className="h-[60%] p-4" style={{ backgroundColor: 'rgba(6, 69, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2%', width: '70%' }}>
            {loopDetails.owner.profile_image && (
              <img
                style={{
                  height: '24px',
                  width: '24px',
                  borderRadius: '50%',
                  zIndex: 2,
                }}
                src={loopDetails.owner.profile_image}
              />
            )}
            <p className="text-new-para-2-mobile">
              &nbsp;&nbsp;@{loopDetails.owner.nickname}
              {getSubscribersCountString(loopDetails.subscriber_count)}
            </p>
          </div>
          <p className="w-[70%] text-new-para-2-mobile">{loopDetails.description}</p>
        </div>
        {renderedImages}
      </div>
    </a>
  )
}

function Categories() {
  return (
    <div>
      <p className="my-2 text-title-md">Categories</p>
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
}: {
  title: string
  subtitle?: string
  description?: string
  image?: string
}) {
  return (
    <div className="flex items-center gap-x-1 rounded-sm p-1 hover:bg-monochrome-9">
      <Avatar className="h-12 w-12 bg-red-40">
        <AvatarImage src={isValidHTTPS(image ?? '')} />
        <AvatarFallback>
          <p className="text-title-md text-monochrome-white">{getAvatarFallback(title)}</p>
        </AvatarFallback>
      </Avatar>
      <div className="mx-2">
        <p className="line-clamp-1 text-title-sm">{title}</p>
        {subtitle && <p className="line-clamp-1 text-cap-lg text-monochrome-black/60">{subtitle}</p>}
        {description && <p className="line-clamp-2 text-cap-lg">{description}</p>}
      </div>
    </div>
  )
}

function Members() {
  return (
    <div>
      <p className="my-2 text-title-md">Members</p>
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
