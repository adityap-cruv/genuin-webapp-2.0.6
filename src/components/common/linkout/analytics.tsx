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
  noOfLinks?: number
}

export function triggerLinkoutEvent({
  clicked,
  cta,
  linkoutId,
  position,
  single,
  videoId,
  link,
  noOfLinks,
}: TriggerLinkoutEventProps) {
  let eventName = ''
  const LINK_CLICKED = 'Link Clicked'
  const CTA_BUTTON_CLICKED = 'Link CTA Button Clicked'

  const properties: any = {
    content_id: videoId,
    linkout_id: linkoutId,
    content_category: 'loop',
    content_type: 'video',
    position,
    no_of_links: noOfLinks ?? 0,
    cta_button: cta ? 'Yes' : 'No',
    thumbnail: link?.hasThumbnail ? 'Yes' : 'No',
    text: link?.hasText ? 'Yes' : 'No',
    cta_url: cta?.link,
    cta_name: cta?.name,
  }

  if (clicked) {
    eventName = clicked === 'cta' ? CTA_BUTTON_CLICKED : LINK_CLICKED
  } else {
    eventName = single ? LINK_CLICKED : LINK_CLICKED // Adjust as needed
    // Add any additional conditions if necessary
  }

  void Analytics.track({
    eventName,
    properties,
  })
}

export function triggerLinkoutViewEvent({ cta, linkoutId, videoId, link, noOfLinks }: TriggerLinkoutEventProps) {
  let eventName = 'Link Viewed'

  const properties: any = {
    content_id: videoId,
    linkout_id: linkoutId,
    content_category: 'loop',
    content_type: 'video',
    no_of_links: noOfLinks ?? 0,
    cta_button: cta ? 'Yes' : 'No',
    thumbnail: noOfLinks ?? 0 > 1 ? null : link?.hasThumbnail ? 'Yes' : 'No',
    text: noOfLinks ?? 0 > 1 ? null : link?.hasText ? 'Yes' : 'No',
  }

  void Analytics.track({
    eventName,
    properties,
  })
}
