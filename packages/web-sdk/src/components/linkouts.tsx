import React, { memo } from 'react'
import { checkAndAppendHttps, cn, getIconLink } from '@/utils'
import { Analytics } from '@/analytics'
import { LinkIcon } from 'lucide-react'
import { Shimmer } from './shimmer'
import { getLinkouts } from './pages/video/api'
// const mockData = [
//   {
//     style: 1,
//     // cta_text: 'Click here',
//     // cta_link: 'https://example.com',
//     links: [
//       {
//         position: 1,
//         link: 'https://link1.com',
//         image:
//           'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//         title:
//           'Mainstays Ferenza Recycled Resin Planter, White, 14in x 14in x 10in if it ex kdflaksjdflksdjflsdkj',
//       },
//       {
//         position: 2,
//         link: 'https://link2.com',
//         image:
//           'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//         title: 'Link 2 Title',
//       },
//       // {
//       //   position: 2,
//       //   link: 'https://link2.com',
//       //   image:
//       //     'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//       //   title: 'Link 2 Title',
//       // },
//       // {
//       //   position: 2,
//       //   link: 'https://link2.com',
//       //   // image:
//       //   //   'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//       //   // title: 'Link 2 Title',
//       // },
//       // {
//       //   position: 2,
//       //   link: 'https://link2.com',
//       //   // image:
//       //   //   'https://media.qa.begenuin.com/uploads/profile_images/brandProfileLogo_1722671619218.png',
//       //   // title: 'Link 2 Title',
//       // },
//     ],
//   },
// ]

type LinkoutsPropsType = {
  linkouts: any
  position: 'overlay' | 'outside'
  imageSize?: number
  forMobile?: boolean
  videoId: string
  linkoutId: string
}

// TODO: Add types for linkouts and make same styling as web application linkouts.
export const Linkouts = memo(function Linkouts({
  linkouts,
  position,
  imageSize,
  forMobile,
  videoId,
  linkoutId,
}: LinkoutsPropsType) {
  // Fetch linkouts if not available.
  let isLoading = false
  if (!linkouts) {
    const resData = getLinkouts(Number(linkoutId))
    isLoading = resData.isLoading
    if (resData.isError) return
    if (resData.data) linkouts = resData.data
  }

  if (isLoading) {
    return <Shimmer className='my-2 h-20 w-full' />
  }

  if (!linkouts || linkouts.length === 0) return

  return (
    <div
      className='overflow-auto w-full'
      onClick={(e) => {
        e.stopPropagation()
      }}>
      {linkouts.map((linkoutItem: any, index: number) => {
        triggerEvent({
          eventName: Analytics.EventNames.LinkoutsViewed,
          videoId,
          linkoutId,
          cta: linkoutItem.cta_link
            ? { name: linkoutItem.cta_text, link: linkoutItem.cta_link }
            : undefined,
          noOfLinks: linkoutItem.links.length,
        })

        if (linkoutItem.links.length === 1) {
          return (
            <div
              key={index}
              className='w-full'>
              {linkoutItem.links.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    style={{
                      padding: 8,
                      backgroundColor:
                        position === 'overlay'
                          ? 'rgba(16, 16, 16, 0.50)'
                          : undefined,
                      borderRadius: 8,
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        marginBottom: linkoutItem.cta_link ? 8 : 0,
                      }}>
                      {item.image && (
                        <div
                          style={{
                            borderRadius: 8,
                            backgroundColor: 'var(--tertiary-200)',
                            padding: 8,
                          }}
                          className='__gen__sdk__flex__center'>
                          <img
                            width={48}
                            height={48}
                            src={item.image}
                            className='object-contain aspect-square h-12 w-12'
                            alt={item.title ?? 'Linkouts'}
                          />
                        </div>
                      )}
                      <LinkItem
                        index={index}
                        linkoutId={linkoutId}
                        videoId={videoId}
                        hasImage={!!item.image}
                        link={item.link}
                        title={item.title}
                        position={position}
                      />
                    </div>
                    {linkoutItem.cta_link && (
                      <CtaButton
                        videoId={videoId}
                        linkoutId={linkoutId}
                        link={linkoutItem.cta_link}
                        text={linkoutItem.cta_text}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        const everyoneHasImage = linkoutItem.links.every(
          (item: any) => item.image,
        )

        if (everyoneHasImage) {
          return (
            <div
              key={index}
              className='w-full '
              style={{
                padding: forMobile ? '8px' : 'unset',
                backgroundColor: forMobile ? 'rgba(16, 16, 16, 0.50)' : 'unset',
                borderRadius: forMobile ? 8 : 'unset',
              }}>
              <div
                className='__gen__sdk__hide__scrollbar w-full overflow-auto flex gap-2'
                style={{
                  marginBottom: linkoutItem.cta_link ? 8 : 'unset',
                }}>
                {linkoutItem.links.map((item: any, index: number) => {
                  return (
                    <a
                      target='_blank'
                      href={checkAndAppendHttps(item.link)}
                      key={index}
                      onClick={() => {
                        triggerEvent({
                          eventName: Analytics.EventNames.LinkoutsClicked,
                          videoId,
                          linkoutId,
                          position: index + 1,
                          clicked: 'link',
                          link: { hasThumbnail: true, hasText: !!item.title },
                        })
                      }}>
                      <div
                        title={item.title ?? undefined}
                        className='flex items-center rounded-lg p-2 justify-center bg-tertiary-100 border-solid border border-tertiary-200'>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title ?? 'linkout'}
                            title={item.title ?? undefined}
                            width={imageSize ?? 80}
                            height={imageSize ?? 80}
                            className={cn(
                              'aspect-square rounded-lg overflow-clip object-contain',
                              imageSize
                                ? `h-[${imageSize}px] w-[${imageSize}px]`
                                : 'h-20 w-20',
                            )}
                          />
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
              {linkoutItem.cta_link && (
                <CtaButton
                  linkoutId={linkoutId}
                  videoId={videoId}
                  link={linkoutItem.cta_link}
                  text={linkoutItem.cta_text}
                />
              )}
            </div>
          )
        } else {
          return (
            <React.Fragment key={index}>
              <div
                key={index}
                className='__gen__sdk__hide__scrollbar overflow-auto whitespace-nowrap mb-2 w-full'>
                {linkoutItem.links.map((item: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className='my-0 mx-2 inline-block align-middle'>
                      <LinkItem
                        index={index}
                        linkoutId={linkoutId}
                        videoId={videoId}
                        key={index}
                        link={item.link}
                        title={item.title}
                      />
                    </div>
                  )
                })}
              </div>
              {linkoutItem.cta_link && (
                <CtaButton
                  linkoutId={linkoutId}
                  videoId={videoId}
                  link={linkoutItem.cta_link}
                  text={linkoutItem.cta_text}
                />
              )}
            </React.Fragment>
          )
        }
      })}
    </div>
  )
})

type CtaButtonProps = {
  link: string
  text?: string | null
  videoId: string
  linkoutId: string
}

export function CtaButton({ link, text, linkoutId, videoId }: CtaButtonProps) {
  return (
    <a
      target='_blank'
      href={checkAndAppendHttps(link)}
      style={{
        padding: '8px 12px',
        backgroundColor: 'var(--primary)',
        borderRadius: 50,
        whiteSpace: 'nowrap',
      }}
      onClick={() => {
        triggerEvent({
          eventName: Analytics.EventNames.LinkoutsCTAClicked,
          videoId,
          linkoutId,
          clicked: 'cta',
          link: { hasThumbnail: false, hasText: !!text },
          cta: { name: text, link },
        })
      }}
      className={
        '__gen__sdk__flex__center __gen__sdk__text__body__2 __gen__sdk__text__white'
      }>
      {text}
    </a>
  )
}

type LinkItemProps = {
  title?: string | null
  link: string
  hasImage?: boolean
  style?: React.CSSProperties
  position?: 'overlay' | 'outside'
  videoId: string
  linkoutId: string
  index: number
}

export function LinkItem({
  link,
  hasImage = false,
  title,
  style,
  position,
  linkoutId,
  videoId,
  index,
}: LinkItemProps) {
  return (
    <a
      target='_blank'
      href={checkAndAppendHttps(link)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: 8,
        borderRadius: !hasImage ? 8 : 0,
        backgroundColor:
          !hasImage && position !== 'overlay'
            ? 'var(--tertiary-200)'
            : undefined,
        ...style,
      }}
      onClick={() => {
        triggerEvent({
          eventName: Analytics.EventNames.LinkoutsClicked,
          videoId,
          linkoutId,
          position: index + 1,
          clicked: 'link',
          link: { hasThumbnail: hasImage, hasText: !!title },
        })
      }}>
      {!title && (
        <LinkIcon
          className={cn(
            'h-4 w-4 shrink-0',
            position === 'overlay' ? 'stroke-white' : 'stroke-foreground',
          )}
        />
      )}
      <p
        className='__gen__sdk__line__clamp__1 __gen__sdk__text__body__2 __gen__sdk__font__weight__demi'
        style={{
          color: position === 'overlay' ? 'white' : undefined,
        }}>
        {title && title !== '' ? title : link}
      </p>
    </a>
  )
}

type TriggerLinkoutEventProps = {
  eventName: string
  linkoutId: string
  videoId: string
  /**
   * Position of link.
   */
  position?: number
  /**
   * Pass false in case of only viewed.
   */
  clicked?: 'cta' | 'link'
  link?: { hasThumbnail: boolean; hasText: boolean }
  cta?: {
    link?: string | null
    name?: string | null
  }
  noOfLinks?: number
}

export function triggerEvent({
  eventName,
  cta,
  linkoutId,
  position,
  videoId,
  link,
  noOfLinks,
}: TriggerLinkoutEventProps) {
  const properties: any = {
    content_id: videoId,
    linkout_id: linkoutId,
    // content_category: 'loop',
    // content_type: 'video',
    position,
    no_of_links: noOfLinks ?? 0,
    cta_button: cta ? 'Yes' : 'No',
    thumbnail: link?.hasThumbnail ? 'Yes' : 'No',
    text: link?.hasText ? 'Yes' : 'No',
    cta_url: cta?.link,
    cta_name: cta?.name,
  }

  void Analytics.track(eventName, properties)
}
