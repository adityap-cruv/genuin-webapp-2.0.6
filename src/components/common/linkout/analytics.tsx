import Analytics from '@/services/analytics'

type TriggerLinkoutEventProps = {
  linkoutId: number
  videoId: string
  single?: boolean
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
}

const Positions: Record<number, string> = {
  1: 'First',
  2: 'Second',
  3: 'Third',
  4: 'Fourth',
}

// TODO: Create a JSON object and simplify the function
export function triggerLinkoutEvent({
  clicked,
  cta,
  linkoutId,
  position,
  single,
  videoId,
  link,
}: TriggerLinkoutEventProps) {
  let eventName = ''
  const properties = {
    content_id: videoId,
    linkout_id: linkoutId,
    content_category: 'loop video',
    content_type: 'video',
  }

  if (clicked) {
    if (clicked === 'link') {
      if (single) {
        eventName += 'Link Redirection'
      } else {
        eventName += Positions[position ?? 1]
        eventName += ' Link Clicked'
      }
    } else {
      eventName += 'Link Button Clicked'
      Object.assign(properties, { cta_name: cta?.name, cta_url: cta?.link })
    }
  } else {
    if (single) {
      if (link?.hasText) {
        if (link.hasThumbnail) {
          eventName = 'Link with Text and Thumbnail'
        } else {
          eventName = 'Link With Text'
        }
        if (cta) {
          eventName += ' and CTA'
          Object.assign(properties, { cta_name: cta.name, cta_url: cta.link })
        }
      } else if (link?.hasThumbnail) {
        eventName = 'Link With Thumbnail'
      } else if (cta) {
        eventName = 'Link With CTA'
        Object.assign(properties, { cta_name: cta.name, cta_url: cta.link })
      } else {
        eventName = 'Single Link'
      }
    } else {
      eventName += 'Multiple Links'
    }
    eventName += ' Viewed'
  }

  void Analytics.track({
    eventName,
    properties,
  })
}
