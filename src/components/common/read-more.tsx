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
      {!showMore && <span className="cursor-pointer pl-1 text-body-1-med text-tertiary">(View less)</span>}
    </p>
  )
}

type WithMentionsProps = {
  textArr: Array<string | { member_id: string; text: string } | { community_id: string; text: string }> | string
} & Omit<Props, 'text'>

export function WithMentions({ textArr, maxChars = 50, className, ...props }: WithMentionsProps) {
  if (typeof textArr === 'string') return <WithoutMentions text={textArr} {...props} />
  const [showMore, setShowMore] = useState(true)
  const [processedComponent, setProcessedComponent] = useState<Array<string | JSX.Element>>([])

  useEffect(() => {
    const SHOW_MORE_BUTTON = (
      <span
        key="show-more"
        onClick={(e) => {
          e.stopPropagation()
          if (showMore) setShowMore(false)
        }}
        className="hidden cursor-pointer pl-1 text-tertiary sm:block">
        (View more)
      </span>
    )
    const SHOW_LESS_BUTTON = (
      <span key="show-less" className="hidden cursor-pointer pl-1 text-tertiary sm:block">
        (View less)
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
      newArr.push(SHOW_LESS_BUTTON)
    }

    if (newArr) setProcessedComponent(newArr)
  }, [textArr, showMore, maxChars])

  return (
    <p
      className={cn('', className)}
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        setShowMore(!showMore)
      }}>
      {processedComponent}
    </p>
  )
}
