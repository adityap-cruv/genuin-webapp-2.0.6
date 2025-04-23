import { checkAndAppendHttps, cn } from '@/utils'
import { LinkedInIcon } from '@/components/icons/social/linkedin-icon'
import { InstagramIcon } from '@/components/icons/social/instagram-icon'
import { TikTokIcon } from '@/components/icons/social/tiktok-icon'
import { TwitterIcon } from '@/components/icons/social/twitter-icon'
import type { ComponentProps } from 'react'
import { LinkIcon } from '@/components/icons/link-icon'

type LinkType = 'linkedin' | 'instagram' | 'twitter' | 'tiktok' | 'webUrl'

type LinkPropsType = {
  links: Partial<Record<LinkType, string | undefined>>
} & ComponentProps<'div'>

export function Links({ links, className, ...restProps }: LinkPropsType) {
  return (
    <div
      className={cn('my-2 flex items-center', className)}
      {...restProps}>
      {links.webUrl && (
        <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1'>
          <a
            href={checkAndAppendHttps(links.webUrl ?? '')}
            target='_blank'>
            <LinkIcon className='h-5 w-5 shrink-0 stroke-primary ' />
          </a>
        </div>
      )}
      {links?.linkedin && (
        <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1'>
          <a
            title='LinkedIn'
            href={checkAndAppendHttps(links.linkedin)}
            target='_blank'>
            <LinkedInIcon className='h-5 w-5 fill-primary ' />
          </a>
        </div>
      )}
      {links?.instagram && (
        <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1'>
          <a
            title='Instagram'
            href={checkAndAppendHttps(links.instagram)}
            target='_blank'>
            <InstagramIcon className='h-5 w-5 fill-primary ' />
          </a>
        </div>
      )}
      {links?.twitter && (
        <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1'>
          <a
            title='X'
            href={checkAndAppendHttps(links.twitter)}
            target='_blank'>
            <TwitterIcon className='h-5 w-5 fill-primary ' />
          </a>
        </div>
      )}
      {links?.tiktok && (
        <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1 px-2'>
          <a
            title='TikTok'
            href={checkAndAppendHttps(links.tiktok)}
            target='_blank'>
            <TikTokIcon className='h-5 w-5 fill-primary ' />
          </a>
        </div>
      )}
    </div>
  )
}
