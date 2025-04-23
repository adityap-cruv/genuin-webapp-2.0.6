import { useSizeContext } from '@/context/size'
import { CustomLink } from '@/router/custom-link'
import { cn, getRedirectionStatusForPaths, tryJsonParse } from '@/utils'
import React, {
  memo,
  ComponentProps,
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type Props = {
  text?: string | null
  /**
   * Pass this variable if you want to increase or decrease slice limit.
   * @default 150
   */
  maxChars?: number
} & ComponentProps<'p'>

type WithMentionsProps = {
  textArr:
    | Array<
        | string
        | { member_id: string; text: string }
        | { community_id: string; text: string }
      >
    | string
} & Omit<Props, 'text'>

// TODO: improve this component to take read-more.
export const ReadMore = memo(function ReadMore({
  textArr,
  ...props
}: WithMentionsProps) {
  if (typeof textArr === 'string') {
    return (
      <WithoutMentions
        text={textArr}
        {...props}
      />
    )
  } else {
    return (
      <WithMentions
        textArr={textArr}
        {...props}
      />
    )
  }
})

function WithMentions({
  textArr,
  maxChars = 150,
  ...props
}: WithMentionsProps) {
  const [showMore, setShowMore] = useState(true)
  const SHOW_MORE_BUTTON = (
    <span
      key='show-more'
      onClick={() => setShowMore((prev) => !prev)}
      style={{
        color: 'var(--tertiary)',
        paddingLeft: 4,
        cursor: 'pointer',
      }}>
      {showMore ? '(View more)' : '(View less)'}
    </span>
  )

  const processedComponent = useMemo(() => {
    if (!textArr || typeof textArr === 'string') return []
    let limit = maxChars
    const newArr: Array<string | JSX.Element> = textArr.reduce(
      (resultArr: Array<string | JSX.Element>, item, i) => {
        if (limit <= 0 && showMore) {
          return resultArr
        }
        if (typeof item === 'string') {
          if (item.length > limit && showMore) {
            const slicedText = item.slice(0, limit)
            resultArr.push(slicedText)
            limit = -1
            return resultArr
          }
          resultArr.push(<span key={i}>{item}</span>)
          limit -= item.length
        } else {
          const isMember = 'member_id' in item
          if (item.text?.length > limit && showMore) {
            const slicedText = item.text.slice(0, limit)
            resultArr.push(
              <span
                key={`mention-${i}`}
                style={{ color: isMember ? 'var(--primary)' : 'inherit' }}>
                {slicedText}
              </span>,
            )
            limit = -1
            return resultArr
          }
          resultArr.push(
            <span
              key={`mention-${i}`}
              style={{ color: isMember ? 'var(--primary)' : 'inherit' }}>
              {item.text}
            </span>,
          )
          limit -= item.text?.length
        }
        return resultArr
      },
      [],
    )
    if (limit <= 0) {
      if (showMore) {
        newArr.push('...')
      }
      newArr.push(SHOW_MORE_BUTTON)
    }
    return newArr
  }, [textArr, showMore, maxChars])

  return (
    <p
      style={{
        wordBreak: 'break-word',
      }}
      {...props}>
      {processedComponent}
    </p>
  )
}

function WithoutMentions({ text, maxChars = 150, ...props }: Props) {
  const [showMore, setShowMore] = useState(false)

  const slicedText = useMemo(() => {
    const validText = text ?? ''
    return validText?.length > maxChars
      ? `${validText.slice(0, maxChars)}...`
      : validText
  }, [text, maxChars])

  if (!text) return null
  return (
    <p
      style={{
        wordBreak: 'break-word',
      }}
      {...props}>
      {showMore ? text : slicedText}
      {text && text?.length > maxChars && (
        <span
          onClick={() => {
            setShowMore((prev) => !prev)
          }}
          style={{
            cursor: 'pointer',
            paddingLeft: 4,
            color: 'var(--tertiary)',
          }}>
          {showMore ? '(View less)' : '(View more)'}
        </span>
      )}
    </p>
  )
}

function applyLineClampStyles(element: HTMLElement, maxLines: number | null) {
  if (maxLines === null) {
    element.style.display = '' // Reset display
    element.style.webkitLineClamp = '' // Reset line clamp
    element.style.webkitBoxOrient = '' // Reset box-orient
    element.style.overflow = '' // Reset overflow
    element.style.textOverflow = '' // Reset text-overflow
  } else {
    element.style.display = '-webkit-box'
    element.style.webkitLineClamp = `${maxLines}`
    element.style.webkitBoxOrient = 'vertical'
    element.style.overflow = 'hidden'
    element.style.textOverflow = 'ellipsis'
  }
}

type DynamicProps = {
  text: any
  maxLines?: number
  showViewMore?: boolean
  shouldAnimate?: boolean
  isExpanded?: boolean
  /**
   * The position of the text.
   * If position is on video or something else than it will have white text. But for outside it will have default behavior.
   * @default 'outside'
   */
  position: 'overlay' | 'outside'
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
} & ComponentProps<'p'>

export const ReadMoreDynamic = memo(function ReadMoreDynamic({
  text,
  maxLines = 1,
  showViewMore = true,
  shouldAnimate = false,
  position = 'outside',
  isExpanded: isExpandedExternal,
  setIsExpanded: setIsExpandedExternal,
  onClick,
  ...props
}: DynamicProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const height = useSizeContext().sizeBoxes.video.height
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const isExpanded = isExpandedExternal ?? isExpandedInternal
  const setIsExpanded = setIsExpandedExternal ?? setIsExpandedInternal
  const redirectionStatus = getRedirectionStatusForPaths()
  const pathName = usePathNameWithSubdomain()

  const convertUrlsToAnchorTags = (strArr: any) => {
    return strArr.map((item: any, index: number) => {
      if (typeof item === 'object' && item.url && item.text) {
        return (
          <a
            key={`url-${index}`}
            href={
              item.url.startsWith('http')
                ? item.url
                : `https://${item.url.replace(/^\/+|\/+$/g, '')}`
            }
            target='_blank'
            rel='noopener noreferrer'
            className={cn('text-primary')}>
            {item.text}
          </a>
        )
      }
      if (typeof item === 'object' && item.member_id && item.text) {
        return (
          <CustomLink
            key={`member-${index}`}
            href={pathName.profile(item.text.slice(1))}
            className={cn(
              'text-primary',
              !redirectionStatus.profile && 'pointer-events-none',
            )}>
            {item.text}
          </CustomLink>
        )
      }
      if (typeof item === 'object' && item.slug && item.text) {
        return (
          <CustomLink
            key={`community-${index}`}
            href={pathName.community(item.slug)}
            className={cn(
              'text-primary',
              !redirectionStatus.community && 'pointer-events-none',
            )}>
            {item.text}
          </CustomLink>
        )
      }
      if (typeof item !== 'object') return item
      return null
    })
  }

  const processedText = useMemo(() => {
    const textObj = tryJsonParse(text)
    return Array.isArray(textObj) ? convertUrlsToAnchorTags(textObj) : textObj
  }, [text])

  useEffect(() => {
    const textElement = textRef.current as unknown as HTMLParagraphElement
    if (textElement) {
      applyLineClampStyles(textElement, maxLines)
    }
  }, [processedText])

  // Improved overflow detection
  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current
      if (!element) return

      // More robust overflow detection
      setTimeout(() => {
        const isTextOverflowing = element.scrollHeight > element.clientHeight
        setIsOverflowing(isTextOverflowing)
      }, 50)
    }

    // Initial check and resize listener
    checkOverflow()
    window.addEventListener('resize', checkOverflow)

    return () => {
      window.removeEventListener('resize', checkOverflow)
      setIsExpanded(false)
    }
  }, [text])

  // This logic is to add line clamp effect to the text.
  useEffect(() => {
    if (!shouldAnimate) return
    if (!textRef.current) return
    const textElement = textRef.current as HTMLParagraphElement

    // If the text is expanded, remove the line clamp effect.
    if (isExpanded) {
      applyLineClampStyles(textElement, null)
      return
    }

    // If the text is not expanded, add the line clamp effect after the animation completes through CSS.
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      applyLineClampStyles(textElement, maxLines)
    }, 500)

    // If timeout isn't cleared, clear it.
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }, [isExpanded])

  const clampedStyle: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  }

  return (
    <>
      {(Array.isArray(processedText) && processedText.length > 0) ||
      (typeof processedText === 'string' && processedText.trim().length > 0) ? (
        <div className='w-full overflow-clip'>
          <p
            {...props}
            className={cn(
              'transition-[max-height] duration-500 sm:max-h-max',
              {
                'swiper-no-swiping __gen__sdk__hide__scrollbar overflow-auto':
                  isExpanded && isMobile,
              },
              props.className,
            )}
            style={{
              // The max height of the text container is calculated based on the height of the video player.
              // If mobile, the max height is 30% of the video player height.
              maxHeight: shouldAnimate
                ? isMobile
                  ? isExpanded
                    ? height * 0.3
                    : maxLines * 24
                  : 'unset'
                : undefined,
            }}
            onClick={(e) => {
              onClick?.(e)
              e.stopPropagation()
            }}>
            <span
              ref={textRef}
              className={cn(
                'w-full break-words',
                position !== 'outside' && 'text-white',
              )}
              style={
                !shouldAnimate && !isExpanded
                  ? clampedStyle
                  : { wordBreak: 'break-word' }
              }
              onClick={
                !showViewMore && isOverflowing
                  ? (e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }
                  : undefined
              }>
              {processedText}
            </span>
            {showViewMore && isOverflowing && (
              <span
                className='cursor-pointer pl-1 text-body-1-med text-tertiary'
                onClick={() => {
                  setIsExpanded((x) => !x)
                }}>
                {isExpanded ? '(View less)' : '(View more)'}
              </span>
            )}
          </p>
        </div>
      ) : (
        <div style={{ margin: '-1rem' }}></div>
      )}
    </>
  )
})
