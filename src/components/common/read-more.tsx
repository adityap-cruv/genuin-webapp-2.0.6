import { useEffect, useState, type ComponentProps } from 'react'
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
  if (!text) return

  const [showMore, setShowMore] = useState(text.length > maxChars)
  let slicedText: string = ''

  if (text && text.length > maxChars) {
    slicedText = text.slice(0, maxChars)
    slicedText = slicedText.endsWith('...') ? slicedText : slicedText + '...'
  }

  return (
    <p {...props}>
      {showMore ? slicedText : text}
      {showMore && (
        <span
          onClick={() => {
            setShowMore((old) => !old)
          }}
          className="cursor-pointer pl-1 text-body-1-med">
          (View more)
        </span>
      )}
    </p>
  )
}

type WithMentionsProps = {
  text?: string | null
  textArr: Array<string | { member_id: string; text: string } | { community_id: string; text: string }>
} & Omit<Props, 'text'>

export function WithMentions({ text, textArr, maxChars = 50, className, ...props }: WithMentionsProps) {
  const [showMore, setShowMore] = useState(true)
  const [processedComponent, setProcessedComponent] = useState<Array<string | JSX.Element>>([])

  useEffect(() => {
    const SHOW_MORE_BUTTON = (
      <span
        key="show-more"
        onClick={() => {
          if (showMore) setShowMore(false)
        }}
        className="cursor-pointer pl-1 text-tertiary">
        (View more)
      </span>
    )
    let limit = maxChars
    const newArr: Array<string | JSX.Element> = []
    if (showMore) {
      for (let i = 0; i < textArr.length; i++) {
        const item = textArr[i]
        if (limit <= 0) {
          break
        }
        if (typeof item === 'string') {
          if (limit > item.length) {
            newArr.push(item)
            limit -= item.length
          } else {
            if (i === textArr.length - 1) {
              if (item.length - limit === 0) {
                newArr.push(item)
              } else {
                newArr.push(item.slice(0, limit) + '...')
                newArr.push(SHOW_MORE_BUTTON)
              }
            } else {
              newArr.push(item.slice(0, limit) + '...')
              newArr.push(SHOW_MORE_BUTTON)
            }
            limit = 0
            break
          }
        } else {
          if (Object.keys(item).includes('member_id')) {
            newArr.push(
              <Link key={i} href={PATH_NAME.profile(item.text.slice(1))} className="text-primary">
                {item.text}
              </Link>
            )
          } else {
            newArr.push(item.text)
          }
          limit -= item.text.length
        }
      }
    } else {
      textArr.forEach((item) => {
        if (typeof item === 'string') {
          newArr.push(item)
        } else {
          if (Object.keys(item).includes('member_id')) {
            newArr.push(
              <Link href={PATH_NAME.profile(item.text.slice(1))} className="text-primary">
                {item.text}
              </Link>
            )
          } else {
            newArr.push(item.text)
          }
        }
      })
    }

    if (newArr) setProcessedComponent(newArr)
  }, [textArr, showMore, maxChars])

  return (
    <p className={cn('', className)} {...props}>
      {!Array.isArray(textArr) ? text : processedComponent}
    </p>
  )
}
