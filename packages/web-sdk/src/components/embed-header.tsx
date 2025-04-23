import { Analytics } from '@/analytics'
import { BaseContext } from '@/context/base'
import { checkAndAppendHttps, cn } from '@/utils'
import { ComponentProps, useContext } from 'react'

type EmbedHeaderPropsType = ComponentProps<'div'> & { forFeed: boolean }

export function EmbedHeader({
  style,
  className,
  forFeed,
}: EmbedHeaderPropsType) {
  const { customizations } = useContext(BaseContext)
  const hasHeadings =
    Boolean(customizations?.heading) ||
    Boolean(customizations?.sub_heading) ||
    Boolean(customizations?.cta_button?.url)
  if (customizations && hasHeadings)
    return (
      <div
        className={cn('flex shrink-0 gap-2', className)}
        style={{
          justifyContent: forFeed ? 'start' : 'space-between',
          alignItems: forFeed ? 'start' : 'center',
          flexDirection: forFeed ? 'column' : 'row',
          ...style,
        }}>
        <div>
          {customizations.heading && (
            <p
              style={{ color: customizations.heading_text_color }}
              className='__gen__sdk__text__title__2 __gen__sdk__font__weight__demi __gen__sdk__line__clamp__1'>
              {customizations.heading}
            </p>
          )}
          {customizations.sub_heading && (
            <p
              className='__gen__sdk__text__body__2 __gen__sdk__font__weight__medium __gen__sdk__line__clamp__1'
              style={{
                color: customizations.sub_heading_text_color
                  ? customizations.sub_heading_text_color
                  : 'var(--secondary-300)',
              }}>
              {customizations.sub_heading}
            </p>
          )}
        </div>
        {customizations.cta_button?.url && (
          <a
            style={{
              color: customizations.cta_button?.text_color
                ? customizations.cta_button?.text_color
                : 'white',
              backgroundColor: customizations.cta_button?.color
                ? customizations.cta_button?.color
                : 'var(--primary-500)',
            }}
            onClick={() => {
              Analytics.track(Analytics.EventNames.EmbedCTAClicked, {
                redirection_url: customizations.cta_button?.url,
                button_name: customizations.cta_button?.text,
              })
            }}
            className='whitespace-nowrap py-2 px-4 rounded-md text-body-1-demi'
            href={checkAndAppendHttps(customizations.cta_button?.url)}
            target='_blank'>
            {customizations.cta_button?.text}
          </a>
        )}
      </div>
    )
}
