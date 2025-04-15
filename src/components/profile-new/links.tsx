import { checkAndAppendHttps, cn } from '@/lib/utils'
import { InstagramIcon } from '@icons/instagram-icon'
import { LinkIcon } from '@icons/link-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TikTokIcon } from '@icons/tiktok-icon'
import { TwitterIcon } from '@icons/twitter-icon'
import { type ComponentProps } from 'react'

type LinkType = 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'webUrl'

type LinkPropsType = {
  links: Partial<Record<LinkType, string | undefined>>
} & ComponentProps<'div'>

export function Links({ links, className, ...restProps }: LinkPropsType) {
  return (
    <div className={cn('my-2 flex items-center', className)} {...restProps}>
      {links.webUrl && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <a href={checkAndAppendHttps(links.webUrl ?? '')} target="_blank" rel="noreferrer">
            <LinkIcon className="h-5 w-5 shrink-0 stroke-primary " />
          </a>
        </div>
      )}
      {links?.linkedin && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <a title="LinkedIn" href={checkAndAppendHttps(links.linkedin)} target="_blank" rel="noreferrer">
            <LinkedInIcon className="h-5 w-5 fill-primary " />
          </a>
        </div>
      )}
      {links?.instagram && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <a title="Instagram" href={checkAndAppendHttps(links.instagram)} target="_blank" rel="noreferrer">
            <InstagramIcon className="h-5 w-5 fill-primary " />
          </a>
        </div>
      )}
      {links?.twitter && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <a title="X" href={checkAndAppendHttps(links.twitter)} target="_blank" rel="noreferrer">
            <TwitterIcon className="h-5 w-5 fill-primary " />
          </a>
        </div>
      )}
      {links?.tiktok && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1 px-2">
          <a title="TikTok" href={checkAndAppendHttps(links.tiktok)} target="_blank" rel="noreferrer">
            <TikTokIcon className="h-5 w-5 fill-primary " />
          </a>
        </div>
      )}
    </div>
  )
}
