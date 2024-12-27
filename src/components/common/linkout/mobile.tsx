import { LinkItem } from './link-item'
import { checkAndAppendHttps } from '@/lib/utils'
import Image from 'next/image'
import { CtaButton } from './cta-button'
import Link from 'next/link'
import React, { memo } from 'react'
import { LinkIcon } from 'lucide-react'
import { type LinkoutsType } from './schema'
import { triggerLinkoutEvent, triggerLinkoutViewEvent } from './analytics'
import { getLinkouts } from './api'
import { Shimmer } from '@/components/ui/shimmer'
// import { motion } from 'framer-motion'

// const fakeData = [
//   {
//     style: 1,
//     cta_text: 'Learn More',
//     cta_link: 'https://example.com/cta',
//     links: [
//       {
//         position: 1,
//         link: 'https://example.com/link1',
//         image: 'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//         title: 'Example Link 1',
//       },
//       // {
//       //   position: 2,
//       //   // link: 'https://example.com/link2',
//       //   // image: null,
//       //   // image: 'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//       //   // title: 'Example Link 2',
//       // },
//     ],
//   },
// ]

export const Mobile = memo(function Mobile({
  linkouts,
  linkoutId,
  videoId,
}: {
  linkouts?: LinkoutsType
  linkoutId: number
  videoId: string
}) {
  let isLoading = false
  if (!linkouts) {
    const resData = getLinkouts(linkoutId)
    isLoading = resData.isLoading
    if (resData.isError) return
    if (resData.data) linkouts = resData.data
  }

  return (
    <div className="pt-2">
      {isLoading ? (
        <Shimmer className="my-2 h-10 w-full" />
      ) : (
        linkouts?.map((linkoutItem, index) => {
          if (linkoutItem.links.length === 1) {
            triggerLinkoutViewEvent({
              linkoutId,
              videoId,
              link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
              cta: linkoutItem.cta_link ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link } : undefined,
              single: true,
              noOfLinks: linkoutItem.links.length,
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
                              noOfLinks: linkoutItem.links.length,
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
                              link: {
                                hasText: !!linkoutItem.links[0].title,
                                hasThumbnail: !!linkoutItem.links[0].image,
                              },
                              cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                              noOfLinks: linkoutItem.links.length,
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
            link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
            cta: linkoutItem.cta_link ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link } : undefined,
            noOfLinks: linkoutItem.links.length,
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
                            noOfLinks: linkoutItem.links.length,
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
                        link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
                        cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                        noOfLinks: linkoutItem.links.length,
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
                            noOfLinks: linkoutItem.links.length,
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
                        link: { hasText: !!linkoutItem.links[0].title, hasThumbnail: !!linkoutItem.links[0].image },
                        cta: { name: linkoutItem.cta_text, link: linkoutItem.cta_link },
                        noOfLinks: linkoutItem.links.length,
                      })
                    }}
                  />
                )}
              </div>
            )
          }
        })
      )}
    </div>
  )
})
