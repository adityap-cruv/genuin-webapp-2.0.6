import { LinkItem } from './link-item'
import { checkAndAppendHttps } from '@/lib/utils'
import Image from 'next/image'
import { CtaButton } from './cta-button'
import Link from 'next/link'
import React from 'react'
import { LinkIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { type LinkoutsType } from './schema'

export function Mobile({ linkouts }: { linkouts: LinkoutsType }) {
  return (
    <motion.div initial={{ y: 75 }} animate={{ y: 0, transition: { duration: 0.3 } }}>
      {linkouts.map((linkoutItem, index) => {
        if (linkoutItem.links.length === 1) {
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
                      <LinkItem hasImage={!!item.image} link={item.link} title={item.title} forMobile />
                    </div>
                    {linkoutItem.cta_link && (
                      <CtaButton link={linkoutItem.cta_link} text={linkoutItem.cta_text} forMobile className="mt-1" />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )
        }

        const everyoneHasImage = linkoutItem.links.every((item) => item.image)

        if (everyoneHasImage) {
          return (
            <div key={index} className="rounded-lg bg-monochrome-black/50 p-2">
              <div className="flex w-full gap-2">
                {linkoutItem.links.map((item, index) => {
                  return (
                    <Link href={checkAndAppendHttps(item.link)} key={index}>
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
                <CtaButton link={linkoutItem.cta_link} text={linkoutItem.cta_text} forMobile className="mt-2" />
              )}
            </div>
          )
        } else {
          return (
            <div key={index} className="rounded-lg bg-monochrome-black/50 p-2">
              <div key={index} className="flex gap-2">
                {linkoutItem.links.map((item, index) => {
                  return (
                    <Link
                      href={checkAndAppendHttps(item.link)}
                      key={index}
                      className="flex aspect-square w-full items-center justify-center rounded-lg bg-tertiary-200 p-2">
                      <LinkIcon className="h-8 w-8 stroke-tertiary" />
                    </Link>
                  )
                })}
              </div>
              {linkoutItem.cta_link && (
                <CtaButton link={linkoutItem.cta_link} text={linkoutItem.cta_text} forMobile className="mt-2" />
              )}
            </div>
          )
        }
      })}
    </motion.div>
  )
}
