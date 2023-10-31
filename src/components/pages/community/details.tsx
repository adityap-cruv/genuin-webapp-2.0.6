'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { checkAndAppendHttps, getAvatarFallback } from '@lib/utils'
import icShare from '@icons/icShareBlue.svg'
import Image from 'next/image'
import Link from 'next/link'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icLink from '@icons/icLinkBlack.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { Separator } from '@components/ui/separator'
import { PATH_NAME } from '@lib/utils/constants/path'

let communityDetailsModule: CommunityDetailsType | null = null

interface Props {
  children: React.ReactNode
  communityDetails: CommunityDetailsType
}

export function CommunityDetails({ children, communityDetails }: Props) {
  communityDetailsModule = communityDetails
  if (communityDetails)
    return (
      <div className="flex h-full w-full min-w-tablet justify-between md:gap-x-2 lg:gap-x-4">
        <Left />
        {children}
        <Right />
      </div>
    )
}

function Left() {
  return (
    <div className="mx-2 mt-2 w-full overflow-y-auto">
      <Avatar className="h-20 w-20 bg-red-50">
        <AvatarImage src={communityDetailsModule?.info.profile_image} />
        <AvatarFallback>
          <p className="text-title-xl text-monochrome-white">{getAvatarFallback(communityDetailsModule?.info.name)}</p>
        </AvatarFallback>
      </Avatar>
      <p className="line-clamp-1 break-all text-title-xl">{communityDetailsModule?.info.name}</p>
      <p className="line-clamp-3 break-all text-body-sm">{communityDetailsModule?.info.description}</p>
      <Stats />
      <div className="my-2 flex items-center gap-x-2">
        <Button variant="default" size="sm">
          <p className="text-title-sm text-monochrome-white">Join</p>
        </Button>
        <Button variant="outline" outlineColor="genuin-blue" size="sm" className="p-1">
          <Image src={icShare} alt="share" />
        </Button>
      </div>
      <Separator className="my-1" />
      <Categories />
      <Links />
      <Separator className="my-2" />
      <Loops />
    </div>
  )
}

function Right() {
  return (
    <div className="ml-2 w-full">
      <Leaders />
      <Members />
    </div>
  )
}

function Categories() {
  return (
    <div>
      <p className="my-2 text-title-md">Categories</p>
      <div>
        {communityDetailsModule?.info.categories.map((cat, index) => {
          return (
            <p key={index} className="mx-1 my-1 inline-block rounded-full bg-monochrome-9 p-1 px-2 text-body-sm">
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

function Loops() {
  return (
    <div>
      <p className="my-2 text-title-md">Popular Loops</p>
      {communityDetailsModule?.popular_loops.map((loop, index) => {
        return (
          <Link key={index} href={{ pathname: PATH_NAME.loop(loop.share_string) }}>
            <ListItem
              title={loop.name}
              image={loop.profile_image ?? undefined}
              subtitle={loop.subscriber_count + (loop.subscriber_count === 1 ? ' Subscriber' : ' Subscribers')}
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
      <Avatar className="h-9 w-9 bg-red-40">
        <AvatarImage src={image} />
        <AvatarFallback>
          <p className="text-title-md text-monochrome-white">{getAvatarFallback(title)}</p>
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="line-clamp-1 text-title-sm">{title}</p>
        {subtitle && <p className="line-clamp-1 text-cap-lg text-monochrome-black/60">{subtitle}</p>}
        {description && <p className="line-clamp-2 text-cap-lg">{description}</p>}
      </div>
    </div>
  )
}

function Leaders() {
  return (
    <div>
      <p className="my-2 text-title-md">Leader</p>
      {communityDetailsModule?.moderators.map((moderator, index) => {
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
