import { LinkItem } from './link-item'
import { checkAndAppendHttps } from '@/lib/utils'
import Image from 'next/image'
import { CtaButton } from './cta-button'
import Link from 'next/link'
import React, { memo } from 'react'
import { LinkIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { type LinkoutsType } from './schema'
import { triggerLinkoutEvent } from './analytics'

export const Mobile = memo(function Mobile({
  linkouts,
  linkoutId,
  videoId,
}: {
  linkouts: LinkoutsType
  linkoutId: number
  videoId: string
}) {
  return (
    <motion.div initial={{ y: 75 }} animate={{ y: 0, transition: { duration: 0.3 } }}>
      {linkouts.map((linkoutItem, index) => {
        if (linkoutItem.links.length === 1) {
          triggerLinkoutEvent({
            linkoutId,
            videoId,
            link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
            cta: linkoutItem.cta_link ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link } : undefined,
            single: true,
          })
          return (
            <div className="rounded-lg bg-monochrome-black/50 p-2" key={index}>
              {linkoutItem.links.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className="flex">
                      {item.image && (
                        <div className="flex items-center justify-center rounded-lg bg-tertiary-200 p-2">
                          <Image
                            width={56}
                            height={56}
                            src={item.image}
                            className="aspect-square object-contain"
                            alt={item.title ?? 'Linkouts'}
                          />
                        </div>
                      )}
                      <LinkItem
                        hasImage={!!item.image}
                        link={item.link}
                        title={item.title}
                        forMobile
                        onClick={(e) => {
                          triggerLinkoutEvent({
                            linkoutId,
                            videoId,
                            link: { hasText: !!item.title, hasThumbnail: !!item.image },
                            single: true,
                            clicked: 'link',
                          })
                        }}
                      />
                    </div>
                    {linkoutItem.cta_link && (
                      <CtaButton
                        link={linkoutItem.cta_link}
                        text={linkoutItem.cta_text}
                        forMobile
                        className="mt-1"
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
                  </React.Fragment>
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
            <div key={index} className="rounded-lg bg-monochrome-black/50 p-2">
              <div
                className={'flex gap-2'}
                style={{
                  width: `${linkoutItem.links.length * 25 > 100 ? 100 : linkoutItem.links.length * 25}%`,
                }}>
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
                          single: false,
                          position: index + 1,
                        })
                      }}>
                      <div
                        title={item.title ?? undefined}
                        className="flex items-center justify-center rounded-lg border border-tertiary-200 bg-tertiary-100 p-2">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.title ?? 'linkout'}
                            title={item.title ?? ''}
                            height={56}
                            width={56}
                            className="object-fill"
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
                  forMobile
                  className="mt-2"
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
            <div key={index} className="rounded-lg bg-monochrome-black/50 p-2">
              <div
                key={index}
                className={'flex gap-2'}
                style={{
                  width: `${linkoutItem.links.length * 25 > 100 ? 100 : linkoutItem.links.length * 25}%`,
                }}>
                {linkoutItem.links.map((item, index) => {
                  return (
                    <Link
                      onClick={(e) => {
                        triggerLinkoutEvent({
                          linkoutId,
                          videoId,
                          clicked: 'link',
                          link: { hasText: !!item.title, hasThumbnail: !!item.image },
                          single: false,
                        })
                      }}
                      href={checkAndAppendHttps(item.link)}
                      key={index}
                      className="flex aspect-square w-full items-center justify-center rounded-lg bg-tertiary-200 p-2">
                      <LinkIcon className="h-8 w-8 stroke-tertiary" />
                    </Link>
                  )
                })}
              </div>
              {linkoutItem.cta_link && (
                <CtaButton
                  link={linkoutItem.cta_link}
                  text={linkoutItem.cta_text}
                  forMobile
                  className="mt-2"
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
      })}
    </motion.div>
  )
})
