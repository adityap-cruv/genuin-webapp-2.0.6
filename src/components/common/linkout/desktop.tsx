import Image from 'next/image'
import { cn, checkAndAppendHttps } from '@/lib/utils'
import { LinkItem } from './link-item'
import { CtaButton } from './cta-button'
import Link from 'next/link'
import { getLinkouts } from './api'
import { Loader } from './loader'
import { memo } from 'react'
import { triggerLinkoutEvent } from './analytics'

type ComponentProps = {
  linkoutId: number
  videoId: string
}

export const Desktop = memo(function Desktop({ linkoutId, videoId }: ComponentProps) {
  if (linkoutId)
    return (
      <div className="py-4">
        <p className="pb-4 text-title-3-bold">Links</p>
        <LinkoutForDesktop linkoutId={linkoutId} videoId={videoId} />
      </div>
    )
})

function LinkoutForDesktop({ linkoutId, videoId }: { linkoutId: number; videoId: string }) {
  const { data: linkouts, isLoading } = getLinkouts(linkoutId)

  if (isLoading || !linkouts) {
    return <Loader />
  }

  return linkouts.map((linkoutItem, index) => {
    if (linkoutItem.links.length === 1) {
      triggerLinkoutEvent({
        linkoutId,
        videoId,
        link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
        cta: linkoutItem.cta_link ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link } : undefined,
        single: true,
      })
      return (
        <div
          className={cn(
            (linkoutItem.cta_link ?? linkoutItem.links[0].image) && 'rounded-xl border border-tertiary-300 p-4'
          )}
          key={index}>
          {linkoutItem.links.map((item, index) => {
            return (
              <div key={index} className="flex w-full items-center gap-x-2">
                {item.image && (
                  <div className="flex items-center justify-center rounded-lg bg-tertiary-200 p-2">
                    <Image
                      width={64}
                      height={64}
                      src={item.image}
                      className="aspect-square object-contain"
                      alt={item.title ?? 'Linkouts'}
                    />
                  </div>
                )}
                <span className="flex w-full flex-col justify-center">
                  <LinkItem
                    hasImage={!!item.image}
                    link={item.link}
                    title={item.title}
                    onClick={(e) => {
                      triggerLinkoutEvent({
                        linkoutId,
                        videoId,
                        clicked: 'link',
                        link: { hasText: !!item.title, hasThumbnail: !!item.image },
                        single: true,
                      })
                    }}
                  />
                  {linkoutItem.cta_link && (
                    <CtaButton
                      link={linkoutItem.cta_link}
                      text={linkoutItem.cta_text}
                      onClick={(e) => {
                        triggerLinkoutEvent({
                          clicked: 'cta',
                          linkoutId,
                          videoId,
                          cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                        })
                      }}
                    />
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )
    }

    const everyoneHasImage = linkoutItem.links.every((item) => item.image)

    triggerLinkoutEvent({
      linkoutId,
      videoId,
      single: false,
      cta: linkoutItem.cta_link ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link } : undefined,
    })
    if (everyoneHasImage) {
      return (
        <div key={index}>
          <div className="mb-2 flex w-full max-w-full gap-2">
            {linkoutItem.links.map((item, index) => {
              return (
                <Link
                  href={checkAndAppendHttps(item.link)}
                  key={index}
                  onClick={(e) => {
                    triggerLinkoutEvent({
                      linkoutId,
                      videoId,
                      clicked: 'link',
                      link: { hasText: !!item.title, hasThumbnail: !!item.image },
                      position: index + 1,
                      single: false,
                    })
                  }}>
                  <div
                    title={item.title ?? undefined}
                    className="flex h-full items-center justify-center rounded-lg border border-tertiary-200 bg-tertiary-100 p-2 hover:shadow-lg">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title ?? 'linkout'}
                        title={item.title ?? undefined}
                        objectFit="fill"
                        width={100}
                        height={100}
                      />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
          {linkoutItem.cta_link && (
            <CtaButton
              link={linkoutItem.cta_link}
              text={linkoutItem.cta_text}
              onClick={(e) => {
                triggerLinkoutEvent({
                  clicked: 'cta',
                  linkoutId,
                  videoId,
                  cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                })
              }}
            />
          )}
        </div>
      )
    } else {
      return (
        <div key={index}>
          <div key={index} className="hide-scrollbar mb-2 overflow-auto whitespace-nowrap">
            {linkoutItem.links.map((item, index) => {
              return (
                <div key={index} className="mx-2 inline-block align-middle">
                  <LinkItem
                    key={index}
                    link={item.link}
                    title={item.title}
                    onClick={(e) => {
                      triggerLinkoutEvent({
                        linkoutId,
                        videoId,
                        clicked: 'link',
                        link: { hasText: !!item.title, hasThumbnail: !!item.image },
                        position: index + 1,
                        single: false,
                      })
                    }}
                  />
                </div>
              )
            })}
          </div>
          {linkoutItem.cta_link && (
            <CtaButton
              link={linkoutItem.cta_link}
              text={linkoutItem.cta_text}
              onClick={(e) => {
                triggerLinkoutEvent({
                  clicked: 'cta',
                  linkoutId,
                  videoId,
                  cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                })
              }}
            />
          )}
        </div>
      )
    }
  })
}
