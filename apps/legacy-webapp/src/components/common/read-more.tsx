import React, { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { PATH_NAME } from '@lib/utils/constants/path'
import { cn, tryJsonParse } from '@lib/utils'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import Link from 'next/link'

export const ReadMore = {
  default: WithoutMentions,
  dynamic: Dynamic,
}

type Props = {
  text?: string | null
  /**
   * Pass this variable if you want to increase or decrease slice limit.
   * @default 150
   */
  maxChars?: number
} & ComponentProps<'p'>

function WithoutMentions({ text, maxChars = 150, ...props }: Props) {
  const [showMore, setShowMore] = useState<boolean>(false)
  const [slicedText, setSlicedText] = useState<string>('')

  useEffect(() => {
    const validText = text ?? ''
    setShowMore(validText.length > maxChars)

    if (validText.length > maxChars) {
      let tempSlicedText = validText.slice(0, maxChars)
      tempSlicedText = tempSlicedText.endsWith('...') ? tempSlicedText : tempSlicedText + '...'
      setSlicedText(tempSlicedText)
    } else {
      setSlicedText(validText)
    }
  }, [text, maxChars])

  if (!text) return null

  return (
    <p {...props}>
      {showMore ? slicedText : text}
      {showMore && (
        <span
          onClick={() => {
            setShowMore((old) => !old)
          }}
          className="cursor-pointer pl-1 text-body-1-med text-tertiary">
          (View more)
        </span>
      )}
      {!showMore && text.length > maxChars && (
        <span
          className="cursor-pointer pl-1 text-body-1-med text-tertiary"
          onClick={() => {
            setShowMore((old) => !old)
          }}>
          (View less)
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

const convertUrlsToAnchorTags = (strArr: any) => {
  return strArr.map((item: any, index: number) => {
    if (typeof item === 'object' && item.url && item.text) {
      return (
        <Link
          key={`url-${index}`}
          href={item.url.startsWith('http') ? item.url : `https://${item.url.replace(/^\/+|\/+$/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('text-primary')}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          {item.text}
        </Link>
      )
    }
    if (typeof item === 'object' && item.member_id && item.text) {
      return (
        <Link
          key={`member-${index}`}
          href={PATH_NAME.profile(item.text.slice(1))}
          className={cn('text-primary')}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          {item.text}
        </Link>
      )
    }
    if (typeof item === 'object' && item.slug && item.text) {
      return (
        <Link
          key={`community-${index}`}
          href={PATH_NAME.community(item.slug)}
          className={cn('text-primary')}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          {item.text}
        </Link>
      )
    }
    if (typeof item !== 'object') return item
    return null
  })
}

type DynamicProps = {
  text: any
  maxLines?: number
  showViewMore?: boolean
  shouldAnimate?: boolean
  /**
   * The position of the text.
   * If position is on video or something else than it will have white text. But for outside it will have default behavior.
   * @default 'outside'
   */
  position: 'overlay' | 'outside'
  isExpanded?: boolean
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
} & ComponentProps<'p'>

export function Dynamic({
  text,
  maxLines = 1,
  showViewMore = true,
  shouldAnimate = false,
  isExpanded: isExpandedExternal,
  setIsExpanded: setIsExpandedExternal,
  position = 'outside',
  onClick,
  ...props
}: DynamicProps) {
  // height is used to calculate the max height of the text container.
  const { height, isMobile } = useGenuinOptions((state) => ({
    height: state.sizeBoxes.default.height,
    isMobile: state.isMobile,
  }))
  const textRef = useRef(null)
  const [isExpandedInternal, setIsExpandedInternal] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const isExpanded = isExpandedExternal ?? isExpandedInternal
  const setIsExpanded = setIsExpandedExternal ?? setIsExpandedInternal

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

  useEffect(() => {
    const checkOverflow = () => {
      const element: any = textRef.current

      if (element?.scrollHeight <= element?.clientHeight || !text) {
        setIsOverflowing(false)
        // setIsExpanded(false)
      }

      if (element) {
        setIsOverflowing(element.scrollHeight > element.clientHeight)
      }
    }
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
      {((Array.isArray(text) && text.length > 0) || (typeof text === 'string' && text.trim().length > 0)) && (
        <div className="w-full overflow-clip">
          <p
            {...props}
            className={cn(
              'transition-[max-height] duration-500 sm:max-h-max',
              {
                'swiper-no-swiping hide-scrollbar overflow-auto': isExpanded && isMobile,
              },
              props.className
            )}
            style={{
              // The max height of the text container is calculated based on the height of the video player.
              // If mobile, the max height is 30% of the video player height.
              maxHeight: shouldAnimate ? (isExpanded ? height * 0.3 : maxLines * 24) : undefined,
            }}
            onClick={(e) => {
              onClick?.(e)
              e.stopPropagation()
            }}>
            <span
              ref={textRef}
              className={cn('w-full break-words', position !== 'outside' && 'text-white')}
              style={!shouldAnimate && !isExpanded ? clampedStyle : { wordBreak: 'break-word' }}
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
                className="cursor-pointer whitespace-normal break-words pl-1 text-body-1-med text-tertiary"
                onClick={() => {
                  setIsExpanded((x) => !x)
                }}>
                {isExpanded ? '(View less)' : '(View more)'}
              </span>
            )}
          </p>
        </div>
      )}
    </>
  )
}
