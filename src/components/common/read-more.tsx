import { useState, type ComponentProps } from 'react'

type Props = {
  text?: string | null
  /**
   * Pass this variable if you want to increase or decrease slice limit.
   * @default 150
   */
  maxChars?: number
} & ComponentProps<'p'>

export function ReadMore({ text, maxChars = 150, ...props }: Props) {
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
