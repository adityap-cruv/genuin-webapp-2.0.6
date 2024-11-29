import React, { useEffect, useState, type ComponentProps } from 'react'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'
import { cn } from '@lib/utils'

export const ReadMore = {
  default: WithoutMentions,
  withMention: WithMentions,
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

type WithMentionsProps = {
  textArr:
    | Array<
        | string
        | { member_id: string; text: string }
        | { community_id: string; text: string }
        | { url: string; text: string }
      >
    | string
  showMore?: boolean
  setShowMore?: (showMore: boolean) => void
} & Omit<Props, 'text'>

export function WithMentions({
  textArr,
  maxChars = 50,
  className,
  showMore: externalShowMore,
  setShowMore: externalSetShowMore,
  ...props
}: WithMentionsProps) {
  if (typeof textArr === 'string') return <WithoutMentions text={textArr} {...props} />
  const [internalShowMore, setInternalShowMore] = useState(true)
  // Use the external state if provided, otherwise fallback to internal state
  const showMore = externalShowMore ?? internalShowMore
  const setShowMore = externalSetShowMore ?? setInternalShowMore

  const [processedComponent, setProcessedComponent] = useState<Array<string | JSX.Element>>([])

  useEffect(() => {
    const SHOW_MORE_BUTTON = (
      <span
        key="show-more"
        onClick={(e) => {
          e.stopPropagation()
          setShowMore(false)
        }}
        className="cursor-pointer pl-1 text-tertiary">
        (View more)
      </span>
    )
    const SHOW_LESS_BUTTON = (
      <span
        key="show-less"
        onClick={(e) => {
          e.stopPropagation()
          setShowMore(true)
        }}
        className="cursor-pointer pl-1 text-tertiary">
        (View less)
      </span>
    )
    let limit = maxChars
    // Type guards for identifying the specific shape of the item
    const isMemberItem = (item: any): item is { member_id: string; text: string } => 'member_id' in item
    const isUrlItem = (item: any): item is { url: string; text: string } => 'url' in item

    const newArr: Array<string | JSX.Element> = []
    if (showMore) {
      for (let i = 0; i < textArr.length; i++) {
        const item = textArr[i]
        if (limit <= 0) {
          break
        }
        if (typeof item === 'string') {
          if (item.length <= limit) {
            newArr.push(item)
            limit -= item.length
          } else {
            newArr.push(item.slice(0, limit) + '...')
            newArr.push(SHOW_MORE_BUTTON)
            break
          }
        } else if (isMemberItem(item)) {
          newArr.push(
            <Link
              onClick={(e) => {
                e.stopPropagation()
              }}
              key={i}
              href={PATH_NAME.profile(item.text.slice(1))}
              className="text-primary">
              {item.text}
            </Link>
          )
          limit -= item.text.length
        } else if (isUrlItem(item)) {
          newArr.push(
            <Link
              onClick={(e) => {
                e.stopPropagation()
              }}
              key={i}
              href={item.url}
              className="text-primary"
              target="_blank">
              {item.text}
            </Link>
          )
          limit -= item.text.length
        }
      }
    } else {
      textArr.forEach((item, index) => {
        if (typeof item === 'string') {
          newArr.push(item)
          limit -= item.length
        } else if (isMemberItem(item)) {
          newArr.push(
            <Link
              onClick={(e) => {
                e.stopPropagation()
              }}
              key={`member-${index}`}
              href={PATH_NAME.profile(item.text.slice(1))}
              className="text-primary">
              {item.text}
            </Link>
          )
          limit -= item.text.length
        } else if (isUrlItem(item)) {
          newArr.push(
            <Link
              onClick={(e) => {
                e.stopPropagation()
              }}
              key={`url-${index}`}
              href={item.url}
              className="text-primary"
              target="_blank">
              {item.text}
            </Link>
          )
          limit -= item.text.length
        }
      })
      if (limit < 0) {
        newArr.push(SHOW_LESS_BUTTON)
      }
    }

    if (newArr) setProcessedComponent(newArr)
  }, [textArr, showMore, maxChars])

  return (
    <p
      className={cn(
        `hide-scrollbar max-h-60 overflow-auto sm:max-h-full sm:overflow-clip ${!showMore && 'swiper-no-swiping'}`,
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        // Only toggle if the "View More" or "View Less" button is present
        const hasToggleButton = processedComponent.some(
          (item) => React.isValidElement(item) && (item.key === 'show-more' || item.key === 'show-less')
        )
        if (hasToggleButton) {
          setShowMore(!showMore)
        }
      }}
      {...props}>
      {processedComponent}
    </p>
  )
}
